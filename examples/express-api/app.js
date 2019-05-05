const express = require('express');
const { middleware: cerise } = require('cerise');
const container = require('./container.js');

const app = express();

app.use(express.json({ limit: 1024 }));
app.use(cerise(container));

for (const module of container('package.modules')) {
  require(`./modules/${module}/index.js`)(app, container);
}

app.use((err, req, res, next) => {
  switch (err.code) {
    case 'ERR_ASSERTION':
    case 'SQLITE_CONSTRAINT': {
      res.status(400);
      res.json({ error: 'bad method' });
      return;
    }
  }

  process.stderr.write(`${err}\n`);
  res.status(500);
  res.json({ error: 'server error' });
});

module.exports = app;
