const { readFileSync } = require('fs');
const request = require('supertest');
const { constant } = require('cerise');
const app = require('../app.js');
const container = require('../container.js');

const database = readFileSync(`${__dirname}/../database.sql`, 'utf8');

describe('todos', () => {
  before(done => {
    container.save();
    container.register('database.path', constant(':memory:'));
    container('database.connection').exec(database, done);
  });

  after(() => {
    container.restore();
  });

  it('cannot create an empty todo', () => {
    return request(app)
      .post('/todos')
      .expect(400)
      .expect('content-type', /json/);
  });

  it('cannot create a blank todo', () => {
    return request(app)
      .post('/todos')
      .send({ text: ' ' })
      .expect(400)
      .expect('content-type', /json/);
  });

  it('can create a todo', async () => {
    await request(app)
      .post('/todos')
      .send({ text: 'fold the laundry' })
      .expect(204);

    const { body } = await request(app)
      .get('/todos')
      .expect(200)
      .expect('content-type', /json/);

    expect(body).to.deep.equal([
      { id: 1, text: 'fold the laundry', done: false },
    ]);
  });

  it('can check a todo', async () => {
    await request(app)
      .put('/todos/1')
      .send({ done: true })
      .expect(204);

    const { body } = await request(app)
      .get('/todos')
      .expect(200)
      .expect('content-type', /json/);

    expect(body).to.deep.equal([
      { id: 1, text: 'fold the laundry', done: true },
    ]);
  });

  it('can uncheck a todo', async () => {
    await request(app)
      .put('/todos/1')
      .send({ done: false })
      .expect(204);

    const { body } = await request(app)
      .get('/todos')
      .expect(200)
      .expect('content-type', /json/);

    expect(body).to.deep.equal([
      { id: 1, text: 'fold the laundry', done: false },
    ]);
  });

  it('cannot reword a todo with blank text', () => {
    return request(app)
      .put('/todos/1')
      .send({ text: ' ' })
      .expect(400)
      .expect('content-type', /json/);
  });

  it('cannot reword a todo buggy data', () => {
    return request(app)
      .put('/todos/1')
      .send({ text: false })
      .expect(400)
      .expect('content-type', /json/);
  });

  it('can reword a todo', async () => {
    await request(app)
      .put('/todos/1')
      .send({ text: 'walk the dog' })
      .expect(204);

    const { body } = await request(app)
      .get('/todos')
      .expect(200)
      .expect('content-type', /json/);

    expect(body).to.deep.equal([{ id: 1, text: 'walk the dog', done: false }]);
  });

  it('can delete a todo', async () => {
    await request(app)
      .delete('/todos/1')
      .expect(204);

    const { body } = await request(app)
      .get('/todos')
      .expect(200)
      .expect('content-type', /json/);

    expect(body).to.be.empty;
  });
});
