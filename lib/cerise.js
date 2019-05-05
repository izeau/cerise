const createContainer = (dependencies, parent) => {
  const state = [];
  const container = name => {
    const cache = container.cache;
    const cached = cache[name];

    if (cached) {
      return cached;
    }

    const dependency = container.registry[name];

    if (!dependency) {
      throw new RangeError(`${name}: unknown dependency`);
    }

    const qualifier = dependency.qualifier;

    if (parent && qualifier === 'singleton') {
      return parent(name);
    }

    const value = dependency(container.proxy);

    if (qualifier === 'scoped' || qualifier === 'singleton') {
      cache[name] = value;
    }

    return value;
  };

  container.scope = () => createContainer(null, container);
  container.registry = Object.create(parent ? parent.registry : null);
  container.cache = Object.create(null);

  container.save = () => {
    if (parent) {
      throw new TypeError('can only call save on a root scope');
    }

    const registry = Object.create(null);
    const cache = Object.create(null);

    for (const [name, dependency] of Object.entries(container.registry)) {
      registry[name] = dependency;
    }

    for (const [name, cachedValue] of Object.entries(container.cache)) {
      cache[name] = cachedValue;
    }

    state.push({ registry, cache });
  };

  container.restore = () => {
    if (state.length < 1) {
      throw new RangeError('no saved state');
    }

    const saved = state.pop();
    const registry = container.registry;
    const cache = container.cache;

    for (const name in registry) {
      delete registry[name];
    }

    for (const name in cache) {
      delete cache[name];
    }

    for (const [name, dependency] of Object.entries(saved.registry)) {
      registry[name] = dependency;
    }

    for (const [name, cachedValue] of Object.entries(saved.cache)) {
      cache[name] = cachedValue;
    }
  };

  container.register = (name, dependency) => {
    if (!dependency.factory) {
      throw new TypeError(`${name}: invalid argument`);
    }

    if (parent && dependency.qualifier === 'singleton') {
      throw new TypeError(
        `${name}: singleton can only be registered on root container`,
      );
    }

    delete container.cache[name];
    container.registry[name] = dependency;
  };

  container.proxy = new Proxy(container, {
    get: (_, name) => container(name),
  });

  for (const [name, dependency] of Object.entries(dependencies || {})) {
    container.register(name, dependency);
  }

  return container;
};

export { createContainer };

export { default as constant } from './factories/constant.js';
export { default as factory } from './factories/factory.js';
export { default as service } from './factories/service.js';

export { default as middleware } from './utils/middleware.js';
export { default as controller } from './utils/controller.js';
