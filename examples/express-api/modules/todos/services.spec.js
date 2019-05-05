const { readFileSync } = require('fs');
const { Database } = require('sqlite3');
const services = require('./services.js');

const database = readFileSync(`${__dirname}/../../database.sql`, 'utf8');

const mockdb = async () => {
  const db = new Database(':memory:');

  await new Promise((resolve, reject) => {
    db.exec(database, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return db;
};

const sql = db => sql => {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

suite('todos', () => {
  suite('todoRepository', () => {
    suite('listTodos', () => {
      test('return todos', async () => {
        const db = await mockdb();

        await sql(db)(`
          insert into todos (text) values
          ('fold the laundry'),
          ('walk the dog')
        `);

        const repository = services.todoRepository({
          'database.connection': db,
        });

        const todos = await repository.listTodos();

        expect(todos).to.deep.equal([
          { rowid: 1, text: 'fold the laundry', done: 0 },
          { rowid: 2, text: 'walk the dog', done: 0 },
        ]);
      });

      test('order todos by done status first, then last update', async () => {
        const db = await mockdb();

        await sql(db)(`
          insert into todos (text, done, updated) values
          ('walk the dog', true, 1),
          ('call at 3PM', false, 3),
          ('fold the laundry', true, 2),
          ('pick mail up', false, 4)
        `);

        const repository = services.todoRepository({
          'database.connection': db,
        });

        const todos = await repository.listTodos();

        expect(todos).to.deep.equal([
          { rowid: 4, text: 'pick mail up', done: 0 },
          { rowid: 2, text: 'call at 3PM', done: 0 },
          { rowid: 3, text: 'fold the laundry', done: 1 },
          { rowid: 1, text: 'walk the dog', done: 1 },
        ]);
      });
    });

    suite('createTodo', () => {
      test('insert a todo in the database', async () => {
        const db = await mockdb();

        const repository = services.todoRepository({
          'database.connection': db,
        });

        await repository.createTodo('walk the dog');

        const todos = await sql(db)('select rowid, text, done from todos');

        expect(todos).to.deep.equal([
          { rowid: 1, text: 'walk the dog', done: 0 },
        ]);
      });
    });

    suite('updateTodo', () => {
      test('update text from a todo', async () => {
        const db = await mockdb();

        await sql(db)(`
          insert into todos (text) values
          ('fold the laundry'),
          ('walk the cat')
        `);

        const repository = services.todoRepository({
          'database.connection': db,
        });

        await repository.updateTodo(2, 'walk the dog');

        const todos = await sql(db)('select text from todos order by rowid');

        expect(todos).to.deep.equal([
          { text: 'fold the laundry' },
          { text: 'walk the dog' },
        ]);
      });
    });

    suite('checkTodo', () => {
      test('mark a todo as done', async () => {
        const db = await mockdb();

        await sql(db)(`
          insert into todos (text) values
          ('fold the laundry')
        `);

        const repository = services.todoRepository({
          'database.connection': db,
        });

        await repository.checkTodo(1);

        const todos = await sql(db)('select text, done from todos');

        expect(todos).to.deep.equal([{ text: 'fold the laundry', done: 1 }]);
      });

      test('update the last update timestamp of a todo', async () => {
        const db = await mockdb();

        await sql(db)(`
          insert into todos (text, updated) values
          ('fold the laundry', -1)
        `);

        const repository = services.todoRepository({
          'database.connection': db,
        });

        await repository.checkTodo(1);

        const [todo] = await sql(db)('select text, updated from todos');

        expect(todo.updated).to.not.equal(-1);
      });
    });

    suite('uncheckTodo', () => {
      test('mark a todo as undone', async () => {
        const db = await mockdb();

        await sql(db)(`
          insert into todos (text, done) values
          ('fold the laundry', 1)
        `);

        const repository = services.todoRepository({
          'database.connection': db,
        });

        await repository.uncheckTodo(1);

        const todos = await sql(db)('select text, done from todos');

        expect(todos).to.deep.equal([{ text: 'fold the laundry', done: 0 }]);
      });

      test('update the last update timestamp of a todo', async () => {
        const db = await mockdb();

        await sql(db)(`
          insert into todos (text, done, updated) values
          ('fold the laundry', 1, -1)
        `);

        const repository = services.todoRepository({
          'database.connection': db,
        });

        await repository.uncheckTodo(1);

        const [todo] = await sql(db)('select text, updated from todos');

        expect(todo.updated).to.not.equal(-1);
      });
    });

    suite('deleteTodo', () => {
      test('delete a todo', async () => {
        const db = await mockdb();

        await sql(db)(`
          insert into todos (text) values
          ('fold the laundry')
        `);

        const repository = services.todoRepository({
          'database.connection': db,
        });

        await repository.deleteTodo(1);

        const todos = await sql(db)('select text from todos');

        expect(todos).to.be.empty;
      });
    });
  });

  suite('serializer', () => {
    test('map internal rowid to id', () => {
      const serializer = services.todoSerializer();
      const todo = { rowid: 1 };
      const serialized = serializer(todo);

      expect(serialized).to.include({ id: 1 });
    });

    test('map the done property type to a boolean', () => {
      const serializer = services.todoSerializer();
      const todo = { done: 1 };
      const serialized = serializer(todo);

      expect(serialized).to.include({ done: true });
    });
  });
});
