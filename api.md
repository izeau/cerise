# API

## createContainer

```js
const { createContainer } = require('cerise');
// or:
import { createContainer } from 'cerise';
```

Create a container, and optionally register services.

- `container(name)`: retrieve a registered service.
- `container.scope()`: create a new scoped container that inherits this one.
- `container.registry`: directly access registered service factories. Not unlike the Wu-Tang Clan, this ain't nuthing ta fuck wit. _This is an internal property that may break without notice; use at your own risk._
- `container.cache`: directly access cached services. _This is an internal property that may break without notice; use at your own risk._
- `container.register(name, serviceFactory)`: register a service using a service factory (i.e something returned by `constant`, `factory` or `service`).
- `container.proxy(name)`: retrieve a registered service -- _alias for `container(name)`_.
- `container.proxy[name]`: retrieve a registered service -- _alias for `container(name)`_.
- `container.save()`: save the container state. Useful for testing before registering test values. _Not available on child containers!_
- `container.restore()`: restore the latest saved state.

### Examples

#### Basic usage:

```js
const container = createContainer();
```

#### Register services on creation:

```js
const container = createContainer({
  name: constant('cerise'),
});
```

## constant

```js
const { constant } = require('cerise');
// or:
import { constant } from 'cerise';
```

Define a service without any dependency. Sugar for `factory(() => x).scoped()`.

### Example

```js
container.register('db', constant(new Database(':memory:')));
```

## factory

```js
const { factory } = require('cerise');
// or:
import { factory } from 'cerise';
```

Takes a callback and defines a lazy-loaded service with optional dependencies. Can be qualified with `.scoped()` or `.singleton()`.

### Examples

#### Basic usage

`upperCaseName` will get called everytime `NAME` is retrieved.

```js
const upperCaseName = ({ name }) => name.toUpperCase();
container.register('NAME', factory(upperCaseName));
```

#### Scoped

`upperCaseName` will get called once for each scope that retrieves it.

```js
const upperCaseName = ({ name }) => name.toUpperCase();
container.register('NAME', factory(upperCaseName).scoped());
```

#### Singleton

`upperCaseName` will get called once (if ever).

```js
const upperCaseName = ({ name }) => name.toUpperCase();
container.register('NAME', factory(upperCaseName).singleton());
```

## service

```js
const { service } = require('cerise');
// or:
import { service } from 'cerise';
```

Takes a class and defines a lazy-loaded service with optional dependencies. Can be qualified with `.scoped()` or `.singleton()`. Sugar for `factory(proxy => new T(proxy))`.

### Examples

#### Basic usage

`NameRepeater` will be instanciated everytime `nameRepeater` is retrieved.

```js
class NameRepeater {
  constructor({ name }) {
    this.name = name;
  }

  repeat(times) {
    return Array(times + 1).join(this.name);
  }
}

container.register('nameRepeater', factory(NameRepeater));
```

#### Scoped

`NameRepeater` will be instanciated once for each scope that retrieves it.

```js
class NameRepeater {
  constructor({ name }) {
    this.name = name;
  }

  repeat(times) {
    return Array(times + 1).join(this.name);
  }
}

container.register('nameRepeater', factory(NameRepeater).scoped());
```

#### Singleton

`NameRepeater` will be instanciated once (if ever).

```js
class NameRepeater {
  constructor({ name }) {
    this.name = name;
  }

  repeat(times) {
    return Array(times + 1).join(this.name);
  }
}

container.register('nameRepeater', factory(NameRepeater).singleton());
```

## middleware

```js
const { middleware } = require('cerise');
// or
import { middleware } from 'cerise';
```

Takes a container and returns an Express / Koa middleware that creates a scope and assigns it to `req.scope` (Express) or `ctx.state.scope` (Koa).

### Examples

#### Express

```js
const express = require('express');
const { createContainer, middleware: cerise } = require('cerise');

const app = express();
const container = createContainer();

// req.scope = container.scope();
app.use(cerise(container));
```

#### Koa

```js
const Koa = require('koa');
const { createContainer, middleware: cerise } = require('cerise');

const app = new Koa();
const container = createContainer();

// ctx.state.scope = container.scope();
app.use(cerise(container));
```

## controller

```js
const { controller } = require('cerise');
// or
import { controller } from 'cerise';
```

Returns an Express route handler that wraps a callback. Said callback will be passed `req.scope.proxy`, `req`, `res` and `next` as argument. \
If you don't end the request yourself (using `res.send`, `res.end`, `res.json`, etc.), whatever you return will be `await`-ed for and sent as JSON. \
Asynchronous errors will be passed to your application [error-handling middleware](http://expressjs.com/en/guide/error-handling.html#writing-error-handlers) for better error handling and recovery.

### Examples

#### Basic usage

```js
app.get(
  '/session',
  controller(({ session }, req, res) => {
    res.json(session);
  }),
);
```

#### Send JSON by returning something

```js
app.get('/session', controller(({ session }) => session));
```

#### Async error handler

```js
// Will trigger your application error handler
app.get(
  '/throws',
  controller(async () => {
    throw new Error('Oops');
  }),
);
```
