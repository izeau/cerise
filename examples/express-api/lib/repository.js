class Repository {
  constructor({ 'database.connection': connection }) {
    this.connection = connection;
  }

  sql(parts, ...params) {
    return new Promise((resolve, reject) => {
      this.connection.all([].concat(parts).join('?'), params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Repository;
