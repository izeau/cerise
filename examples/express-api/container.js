const { createContainer, constant, factory } = require('cerise');
const { Database } = require('sqlite3');
const package = require('./package.json');

const container = createContainer({
  'package.version': constant(package.version),
  'package.modules': constant(package.modules),
  'database.path': constant('database.sqlite'),
  'database.connection': factory(({ 'database.path': path }) => {
    return new Database(path);
  }).singleton(),
});

module.exports = container;
