const request = require('supertest');
const { constant } = require('cerise');
const app = require('../app.js');
const container = require('../container.js');

describe('version', () => {
  before(() => {
    container.save();
  });

  after(() => {
    container.restore();
  });

  it('can read the package version', async () => {
    container.register('package.version', constant('1.2.3'));

    const { body } = await request(app)
      .get('/version')
      .expect(200)
      .expect('content-type', /json/);

    expect(body).to.include({ version: '1.2.3' });
  });
});
