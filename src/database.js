const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'test123*',
  database: 'interbar',
  port: 3306,
  connectionLimit: 100
});

exports.query = (sql, args) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      throw err;
    } else {
      connection.query(sql, args, (err, rows) => {
        connection.release();
        if (err) {
          console.log(err);
          throw err;
        }
        return rows;
      });
    }
  });
}