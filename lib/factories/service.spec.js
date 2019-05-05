import service from './service.js';

suite('service dependency', () => {
  test('return a class instance', () => {
    class A {}
    class B {}

    const a = service(A);
    const b = service(B);

    expect(a()).to.be.an.instanceOf(A);
    expect(b()).to.be.an.instanceOf(B);
  });

  test('flagged as factory', () => {
    const a = service(class {});

    expect(a).to.include({ factory: true });
  });

  test('pass argument to the constructor', () => {
    const a = service(function(x) { this.a = x }); // prettier-ignore
    const b = service(function(x) { this.b = x }); // prettier-ignore

    expect(a(1)).to.include({ a: 1 });
    expect(b(2)).to.include({ b: 2 });
  });

  test('qualifiable as scoped', () => {
    const a = service().scoped();

    expect(a).to.include({ qualifier: 'scoped' });
  });

  test('qualifiable as singleton', () => {
    const a = service().singleton();

    expect(a).to.include({ qualifier: 'singleton' });
  });
});
