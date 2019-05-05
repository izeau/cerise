const controllers = require('./controllers.js');

module.exports = (app, container) => {
  app.get('/version', controllers.readVersion);
};
