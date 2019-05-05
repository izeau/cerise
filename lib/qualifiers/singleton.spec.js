import singleton from './singleton.js';

suite('singleton qualifier', () => {
  test('return self', () => {
    const a = { singleton };

    expect(a.singleton()).to.equal(a);
  });

  test('set the q property', () => {
    const a = { singleton };

    expect(a.singleton()).to.include({ qualifier: 'singleton' });
  });
});
