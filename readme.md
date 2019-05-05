# Cerise

![](https://img.shields.io/npm/l/cerise.svg?logo=npm)
![](https://img.shields.io/npm/v/cerise.svg?logo=npm)
![](https://img.shields.io/badge/dependencies-none-green.svg?logo=npm)
![](https://img.shields.io/travis/izeau/cerise.svg?logo=travis)
![](https://img.shields.io/coveralls/github/izeau/cerise.svg?logo=travis)

Intuitive _Dependency Injection (DI)_ library for Node.js, written in JavaScript and weighing less than 10 KB. Ironically, Cerise does not depend on any package.

[API documentation](/api.md) -- [Examples](/examples) -- [FAQ](#faq)

# Installation

Install with `npm` or `yarn`

```shell
$ npm install cerise
$ yarn add cerise
```

Both _CommonJS_ and _ES modules_ builds are included; the latter will be automatically selected if your build system supports it.

# Usage

Using Cerise is _dead simple_. There are two concepts you'll need to understand first: _containers_ and _factories_.

## createContainer

A _container_ (also known as an _injector_) is a master object that knows how to create services, thanks to _factories_.

```js
const { createContainer, constant, factory, service } = require('cerise');

// Create a container and immediately register a factory
// for the `name` service.
const container = createContainer({
  package_name: constant('cerise'),
});

// You can also register a service for an existing container.
container.register('package_name', constant('cerise'));

// You can retrieve services using either container as a
// function, or its `proxy` property.
assert('cerise' === container('package_name'));
assert('cerise' === container.proxy.package_name);
```

There are multiple ways to declare a service: using the `constant`, `factory` and `service` helpers.

## constant

When using `constant` you cannot depend on an other service. You can register any value: a number, string, function, etc.

```js
container.register('base_url', constant('https://npmjs.com'));
container.register('concat', constant((...args) => args.join('')));

assert('string' === typeof container('base_url'));
assert('function' === typeof container('concat'));
```

## factory

If you need to depend on an other service, use a factory. `factory` takes a function that will be passed `container.proxy` (which can be destructured to access other services) and returns a service.

```js
container.register(
  'package_url',
  factory(proxy => {
    return proxy.concat(proxy.base_url, '/', proxy.package_name);
  }),
);

// Using destructuring
container.register(
  'package_url',
  factory(({ concat, base_url: baseUrl, package_name: packageName }) => {
    return concat(baseUrl, '/', packageName);
  }),
);

// Alternatively, call the proxy as a function
container.register(
  'package_url',
  factory(inject => {
    return inject('concat')(inject('base_url'), '/', inject('package_name'));
  }),
);

assert('https://npmjs.com/cerise' === container('package_url'));
```

You'll notice that `constant(x)` is equivalent to `factory(() => x)`: it's just sugar.

## service

Lastly, `service` is passed a class and will return an instance on retrieval. Use it if you're more familiar with OOP.

```js
class PackageUrl {
  constructor({ concat, base_url: baseUrl }) {
    this._concat = concat;
    this._baseUrl = baseUrl;
  }

  get(packageName) {
    return this._concat(this._baseUrl, '/', packageName);
  }
}

container.register('package_url', service(PackageUrl));

assert('https://npmjs.com/cerise' === container('package_url').get('cerise'));
```

Once again, it's just sugar: `service(T)` is equivalent to `factory(proxy => new T(proxy))`.

# Scopes

Oftentimes you'll want to create a _scope_ from a container. _Scopes_ inherit their parent and their registered service, but can also have their own service. For instance, if you're using Express, you might want to have a master container to store your database connexion, and another container for request-specific data.

```js
const express = require('express');
const { Database } = require('sqlite3');
const { createContainer, constant } = require('cerise');

const app = express();
const container = createContainer({
  db: constant(new Database(':memory:')),
});

// For each request, create a scope and fetch session data.
app.use((req, res, next) => {
  const id = req.get('x-session-id');
  const db = container('db');

  req.scope = container.scope();

  db.get('select * from sessions where id = ?', [id], (err, session) => {
    // Only alter the request scope, not the parent container
    req.scope.register('session', constant(session));
    next();
  });
});

// Session data is available on child scope.
app.get('/session', (req, res) => {
  res.json(req.scope('session'));
});

// Parent container services are also available on child scope.
app.get('/time', (req, res) => {
  const db = req.scope('db');

  db.get('select current_timestamp as time', (err, { time }) => {
    res.json({ time });
  });
});
```

# Lifetimes

## default lifetime

By default (except for `constant`) the factory will be called each time you wish to retrieve a value from a factory.

```js
// Each resolution will result in a new Thing instance being created.
container.register('thing', service(class Thing {}));

const foo = container('thing');
const bar = container('thing');

assert(foo !== bar);
```

## singletons

You may however wish to specify a lifetime to your factory in order to cache its result.

```js
// Now the first instance will be cached and returned each time.
container.register('thing', service(class Thing {}).singleton());

const foo = container('thing');
const bar = container('thing');

assert(foo === bar);
```

## scoped

Singletons only make sense on the root container; if you wish to cache a service for scopes you will want to use the `scoped` lifetime qualifier:

```js
const winston = require('winston');

container.register(
  'logger',
  constant(
    winston.createLogger({
      transports: winston.transports.Console(),
    }),
  ),
);

// Create a scope on every request
app.use((req, res, next) => {
  req.scope = container.scope();
  next();
});

// Register a *scoped* logger (with request id metadata)
app.use((req, res, next) => {
  req.scope.register(
    'reqlog',
    factory(({ logger }) =>
      logger.child({ requestId: req.get('x-request-id') }),
    ).scoped(),
  );
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const logger = req.scope('reqlog');

  req.on('finish', () => {
    const elapsed = Date.now() - start;

    logger.info('[%s] %s %s', elapsed, req.method, req.path);
  });

  next();
});
```

# Saving and restoring state

Root containers' state can be saved and restored which can be useful for testing. For instance, in Mocha's `beforeEach` and `afterEach` hooks:

```js
describe('My API', () => {
  beforeEach(() => container.save());
  afterEach(() => container.restore());

  it('...', () => {
    // package_url service will be 'nope' but only for this particular test
    container.register('package_url', constant('nope'));
  });
});
```

# Utils

**Middlewares:** Cerise provides middlewares for Express and Koa. \
See the [API documentation](/api.md#middleware).

**Controllers:** since calling `req.scope` gets old really fast, Cerise also provides a `controller` helper -- with an async error handler for convenience. Pass it a callback, and it will get called with `req.scope.proxy`, `req`, `res` and `next`. \
See the [API documentation](/api.md#controller).

# FAQ

## How to overwrite a parent service in a scope?

You can register a service with the same name:

```js
const parent = createContainer();
parent.register('scopeName', constant('parent'));

const child = parent.scope();
child.register('scopeName', constant('child'));

assert('parent' === parent('scopeName'));
assert('child' === child('scopeName'));
```

## Can a child scope service depend on a parent scope service of the same name?

Yes, but you cannot depend directly on the parent service.

```js
parent.register('breadcrumb', constant('/'));

// This will break: `breadcrumb` on the child cannot depend on `breadcrumb`.
child.register(
  'breadcrumb',
  factory(({ breadcrumb }) => breadcrumb + 'child/'),
);

// Workaround #1: access parent scope directly
child.register('breadcrumb', factory(() => parent('breadcrumb') + 'child/'));

// Workaround #2 (preferred): register the parent as a child service
child.register('$parent', constant(parent.scope));
child.register(
  'breadcrumb',
  factory(({ $parent: { breadcrumb } }) => breadcrumb + 'child/'),
);
```

# Examples

Head over to the [examples](/examples) directory for in-depth examples.

# Contributing

Constructive feedback is always welcome! Feel free to create issues if you have any question, suggestion or bug reports. A pull request is also always appreciated.

Clone this repository, run `npm install` or `yarn` to install the development dependencies, launch `npm test -- -w` or `yarn test -w` and start hacking!

Before you submit your pull request, please make sur you've run Prettier (`npm run lint` or `yarn lint`) and that your test coverage is at 100% (`npm run coverage` or `yarn coverage`).
