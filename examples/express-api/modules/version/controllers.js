const { controller } = require('cerise');

exports.readVersion = controller(({ 'package.version': version }) => {
  return { version };
});
