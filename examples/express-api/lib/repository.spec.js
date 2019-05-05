const Repository = require('./repository.js');

suite('Repository', () => {
  suite('sql', () => {
    test('return a Promise', () => {
      const db = { all: () => {} };
      const repository = new Repository({ 'database.connection': db });

      expect(repository.sql``).to.be.an.instanceOf(Promise);
    });

    test('call connection.all with a prepared statement', () => {
      const db = { all: spy() };
      const repository = new Repository({ 'database.connection': db });

      repository.sql`select ${1} = 1`;

      expect(db.all).to.have.been.calledWith('select ? = 1', [1]);
    });

    test('resolve with query results', async () => {
      const db = { all: spy((q, p, fn) => fn(null, [{ a: 1 }])) };
      const repository = new Repository({ 'database.connection': db });
      const rows = await repository.sql``;

      expect(rows).to.deep.equal([{ a: 1 }]);
    });

    test('reject with query error', async () => {
      const err = new Error('xxx');
      const db = { all: spy((q, p, fn) => fn(err)) };
      const repository = new Repository({ 'database.connection': db });

      const rejection = await repository.sql``.then(
        () => expect.fail(),
        x => x,
      );

      expect(rejection).to.equal(err);
    });
  });
});
