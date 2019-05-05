const app = require('./app.js');

const panic = err => {
  process.stderr.write(`${err}\n`);
  process.exit(1);
};

process.on('uncaughtException', panic);
process.on('unhandledRejection', panic);

app.listen(3000);
