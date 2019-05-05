const controllers = require('./controllers.js');
const services = require('./services.js');

module.exports = (app, container) => {
  app.get('/todos', controllers.listTodos);
  app.post('/todos', controllers.createTodo);
  app.put('/todos/:id', controllers.updateTodo);
  app.delete('/todos/:id', controllers.deleteTodo);

  container.register('todos.repository', services.todoRepository);
  container.register('todos.serializer', services.todoSerializer);
};
