const { constant, service } = require('cerise');
const Repository = require('../../lib/repository.js');

class TodoRepository extends Repository {
  listTodos() {
    return this.sql`
      select rowid, text, done
      from todos
      order by done, updated desc
    `;
  }

  async createTodo(text) {
    await this.sql`insert into todos (text) values (${text})`;
  }

  async updateTodo(id, text) {
    await this.sql`update todos set text = ${text} where rowid = ${id}`;
  }

  async checkTodo(id) {
    await this.sql`update todos set done = true where rowid = ${id}`;
  }

  async uncheckTodo(id) {
    await this.sql`update todos set done = false where rowid = ${id}`;
  }

  async deleteTodo(id) {
    await this.sql`delete from todos where rowid = ${id}`;
  }
}

const todoSerializer = ({ rowid: id, text, done }) => ({
  id,
  text,
  done: Boolean(done),
});

exports.todoRepository = service(TodoRepository).singleton();
exports.todoSerializer = constant(todoSerializer);
