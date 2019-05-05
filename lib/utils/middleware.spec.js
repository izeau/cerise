import middleware from './middleware.js';

suite('middleware', () => {
  test('create a new scope', () => {
    const createScope = spy();
    const container = { scope: createScope };
    const req = {};
    const next = () => {};

    middleware(container)(req, null, next);

    expect(createScope).to.have.been.called;
  });

  test('set scope on the request object (express)', () => {
    const scope = {};
    const container = { scope: () => scope };
    const req = {};
    const next = () => {};

    middleware(container)(req, null, next);

    expect(req).to.include({ scope });
  });

  test('call next middleware (express)', () => {
    const req = {};
    const next = spy();
    const container = { scope: () => {} };

    middleware(container)(req, null, next);

    expect(next).to.have.been.called;
  });

  test('set scope on the ctx.state object (koa)', () => {
    const scope = {};
    const container = { scope: () => scope };
    const ctx = { state: {} };
    const next = () => {};

    middleware(container)(ctx, next);

    expect(ctx.state).to.include({ scope });
  });

  test('call next middleware (koa)', () => {
    const container = { scope: () => {} };
    const ctx = { state: {} };
    const next = () => 1;
    const ware = spy(middleware(container));

    ware(ctx, next);

    expect(ware).to.have.returned(1);
  });
});
