const mysql = require("mysql");
exports.pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "interbar",
  port: process.env.DATABASE_PORT,
  connectionLimit: 100,
});
