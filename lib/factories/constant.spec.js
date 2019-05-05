import constant from './constant.js';

suite('constant dependency', () => {
  test('return a given value', () => {
    const a = constant('a');
    const b = constant('b');

    expect(a()).to.equal('a');
    expect(b()).to.equal('b');
  });

  test('flagged as factory', () => {
    const a = constant('a');

    expect(a).to.include({ factory: true });
  });

  test('qualified as scoped', () => {
    const a = constant('a');

    expect(a).to.include({ qualifier: 'scoped' });
  });
});
