import { createContainer, constant, factory } from './cerise.js';

suite('createContainer', () => {
  test('throw when registering an malformed dependency', () => {
    const container = createContainer();

    expect(() => {
      container.register('a', 1);
    }).to.throw(TypeError, 'a: invalid argument');
  });

  test('not throw when registering a dependency', () => {
    const container = createContainer();

    expect(() => {
      container.register('a', { factory: () => 1 });
    }).to.not.throw();
  });

  test('throw on unknown dependency', () => {
    const container = createContainer();

    expect(() => {
      container('a');
    }).to.throw(RangeError, 'a: unknown dependency');
  });

  test('retrieve a factory result', () => {
    const container = createContainer();

    container.register('a', constant(1));
    container.register('b', constant(2));

    expect(container('a')).to.equal(1);
    expect(container('b')).to.equal(2);
  });

  test('register dependencies on construction', () => {
    const container = createContainer({
      a: constant(1),
      b: constant(2),
    });

    expect(container('a')).to.equal(1);
    expect(container('b')).to.equal(2);
  });

  test('expose a proxy object', () => {
    const container = createContainer();

    container.register('a', constant(1));
    container.register('b', constant(2));

    expect(container.proxy.a).to.equal(1);
    expect(container.proxy.b).to.equal(2);
  });

  test('expose a proxy function', () => {
    const container = createContainer();

    container.register('a', constant(1));
    container.register('b', constant(2));

    expect(container.proxy('a')).to.equal(1);
    expect(container.proxy('b')).to.equal(2);
  });

  test('pass proxy object to dependency factories', () => {
    const container = createContainer();

    container.register('a', constant(1));
    container.register('b', factory(({ a }) => a * 2));

    expect(container('b')).to.equal(2);
  });

  test('create scopes', () => {
    const one = createContainer();
    const two = one.scope();
    const three = two.scope();

    two.register('a', constant(1));

    expect(three('a')).to.equal(1);
  });

  test('not cache unqualified values', () => {
    const container = createContainer();
    const myFactory = spy(() => 1);

    container.register('a', factory(myFactory));

    expect(container('a')).to.equal(1);
    expect(container('a')).to.equal(1);
    expect(myFactory).to.have.been.calledTwice;
  });

  test('cache scoped values', () => {
    const container = createContainer();
    const myFactory = spy(() => 1);

    container.register('a', factory(myFactory).scoped());

    expect(container('a')).to.equal(1);
    expect(container('a')).to.equal(1);
    expect(myFactory).to.have.been.calledOnce;
  });

  test('bust cache if registering same name dependency', () => {
    const container = createContainer();

    container.register('a', constant(1));
    expect(container('a')).to.equal(1);

    container.register('a', constant(2));
    expect(container('a')).to.equal(2);
  });

  test('cache scoped value in each scope', () => {
    const container = createContainer();
    const scope = container.scope();
    const myFactory = spy(() => 1);

    container.register('a', factory(myFactory).scoped());

    expect(scope('a')).to.equal(1);
    expect(container('a')).to.equal(1);
    expect(myFactory).to.have.been.calledTwice;
  });

  test('shadow parent dependency', () => {
    const one = createContainer();
    const two = one.scope();
    const three = two.scope();

    one.register('a', constant(1));
    two.register('a', constant(2));
    three.register('a', constant(3));

    expect(one('a')).to.equal(1);
    expect(two('a')).to.equal(2);
    expect(three('a')).to.equal(3);
  });

  test('throw when registering a singleton on child container', () => {
    const container = createContainer();
    const scope = container.scope();

    expect(() => {
      scope.register('a', factory(() => 1).singleton());
    }).to.throw(
      TypeError,
      'a: singleton can only be registered on root container',
    );
  });

  test('cache singleton values', () => {
    const container = createContainer();
    const myFactory = spy(() => 1);

    container.register('a', factory(myFactory).singleton());

    expect(container('a')).to.equal(1);
    expect(container('a')).to.equal(1);
    expect(myFactory).to.have.been.calledOnce;
  });

  test('cache singleton value in root scope', () => {
    const one = createContainer();
    const two = one.scope();
    const three = two.scope();

    const myFactory = spy(() => 1);

    one.register('a', factory(myFactory).singleton());

    expect(one('a')).to.equal(1);
    expect(two('a')).to.equal(1);
    expect(three('a')).to.equal(1);
    expect(myFactory).to.have.been.calledOnce;
  });

  test('throw when saving child scope state', () => {
    const parent = createContainer();
    const child = parent.scope();

    expect(() => child.save()).to.throw(
      TypeError,
      'can only call save on a root scope',
    );
  });

  test('save state when saving root scope state', () => {
    const container = createContainer();

    expect(() => container.save()).to.not.throw();
  });

  test('throw when restoring and no state stack', () => {
    const container = createContainer();

    expect(() => container.restore()).to.throw(RangeError, 'no saved state');
  });

  test('restore previously saved state', () => {
    const original = spy(() => 'original');
    const updated = spy(() => 'updated');
    const container = createContainer();

    container.register('a', factory(original).singleton());

    expect(container('a')).to.equal('original');
    expect(container('a')).to.equal('original');
    expect(original).to.have.been.calledOnce;

    container.save();
    container.register('a', factory(updated).singleton());

    expect(container('a')).to.equal('updated');
    expect(container('a')).to.equal('updated');
    expect(updated).to.have.been.calledOnce;

    container.restore();

    expect(container('a')).to.equal('original');
    expect(original).to.have.been.calledOnce;
  });
});
