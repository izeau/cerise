import scoped from './scoped.js';

suite('scoped qualifier', () => {
  test('return self', () => {
    const a = { scoped };

    expect(a.scoped()).to.equal(a);
  });

  test('set the q property', () => {
    const a = { scoped };

    expect(a.scoped()).to.include({ qualifier: 'scoped' });
  });
});
