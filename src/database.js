const mysql = require("mysql");
let database = "";
if (process.env.NODE_ENV === "production") {
  database = process.env.DATABASE_PROD;
} else if (process.env.NODE_ENV === "development") {
  database = process.env.DATABASE_DEV;
} else if (process.env.NODE_ENV === "testing") {
  database = process.env.DATABASE_TESTING;
}
exports.pool = mysql.createPool({
  host: process.env.API_HOST,
  user: "root",
  password: process.env.DB_PASSWORD,
  database: database,
  port: process.env.DATABASE_PORT,
  connectionLimit: 100,
});
