import controller from './controller.js';

suite('controller', () => {
  test('call middleware with proxy from request', async () => {
    const req = { scope: { proxy: {} } };
    const res = { finished: true };
    const middleware = spy();

    await controller(middleware)(req, res);

    expect(middleware).to.have.been.calledWith(req.scope.proxy);
  });

  test('call middleware with req, res, next', async () => {
    const req = { scope: {} };
    const res = { finished: true };
    const next = () => {};
    const middleware = spy();

    await controller(middleware)(req, res, next);

    expect(middleware).to.have.been.calledWith(sinon.match.any, req, res, next);
  });

  test('call res.json if there is data', async () => {
    const req = { scope: {} };
    const res = { finished: false, json: spy() };
    const data = {};

    await controller(() => data)(req, res);

    expect(res.json).to.have.been.calledWith(data);
  });

  test('call res.json if there is resolved data', async () => {
    const req = { scope: {} };
    const res = { finished: false, json: spy() };
    const data = {};

    await controller(async () => data)(req, res);

    expect(res.json).to.have.been.calledWith(data);
  });

  test('call res.sendStatus if there is no data', async () => {
    const req = { scope: {} };
    const res = { finished: false, sendStatus: spy() };

    await controller(() => {})(req, res);

    expect(res.sendStatus).to.have.been.calledWith(204);
  });

  test('do not call res.json if res.finished is truthy', async () => {
    const req = { scope: {} };
    const res = { finished: true, json: spy() };
    const data = {};

    await controller(() => data)(req, res);

    expect(res.json).to.not.have.been.called;
  });

  test('call next if middleware returns a rejected promise', async () => {
    const req = { scope: {} };
    const res = { finished: true };
    const next = spy();
    const err = new Error('error');

    await controller(() => Promise.reject(err))(req, res, next);

    expect(next).to.have.been.calledWith(err);
  });
});
