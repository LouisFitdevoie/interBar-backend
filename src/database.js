const mysql = require('mysql');
exports.pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'test123*',
  database: 'interbar',
  port: 3306,
  connectionLimit: 100
});