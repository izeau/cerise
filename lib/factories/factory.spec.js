import factory from './factory.js';

suite('factory dependency', () => {
  test('return a function result', () => {
    const a = factory(() => 'a');
    const b = factory(() => 'b');

    expect(a()).to.equal('a');
    expect(b()).to.equal('b');
  });

  test('flagged as factory', () => {
    const a = factory(() => 'a');

    expect(a).to.include({ factory: true });
  });

  test('pass argument to the underlying function', () => {
    const a = factory(x => x + 1);
    const b = factory(x => x * 2);

    expect(a(1)).to.equal(2);
    expect(b(2)).to.equal(4);
  });

  test('qualifiable as scoped', () => {
    const a = factory().scoped();

    expect(a).to.include({ qualifier: 'scoped' });
  });

  test('qualifiable as singleton', () => {
    const a = factory().singleton();

    expect(a).to.include({ qualifier: 'singleton' });
  });
});
