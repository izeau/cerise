const { strict: assert } = require('assert');
const { controller } = require('cerise');

exports.listTodos = controller(
  async ({
    'todos.repository': TodosRepository,
    'todos.serializer': serialize,
  }) => {
    const todos = await TodosRepository.listTodos();

    return todos.map(serialize);
  },
);

exports.createTodo = controller(
  async ({ 'todos.repository': TodosRepository }, req) => {
    await TodosRepository.createTodo(req.body.text);
  },
);

exports.updateTodo = controller(
  async ({ 'todos.repository': TodosRepository }, req) => {
    if ('text' in req.body) {
      assert(typeof req.body.text === 'string');
      await TodosRepository.updateTodo(req.params.id, req.body.text);
    } else if ('done' in req.body) {
      assert(typeof req.body.done === 'boolean');

      if (req.body.done) {
        await TodosRepository.checkTodo(req.params.id);
      } else {
        await TodosRepository.uncheckTodo(req.params.id);
      }
    }
  },
);

exports.deleteTodo = controller(
  async ({ 'todos.repository': TodosRepository }, req) => {
    await TodosRepository.deleteTodo(req.params.id);
  },
);
