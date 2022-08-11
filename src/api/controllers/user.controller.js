const uuid = require('uuid');
const database = require('../../database.js');
const pool = database.pool;
const bcrypt = require('bcrypt');

class User {
  constructor(emailAddress, firstName, lastName, password) {
    this.emailAddress = emailAddress;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
  }
  id = uuid.v4();
  emailAddress;
  firstName;
  lastName;
  password;
  deleted_at = null;
}

exports.getAllUsers = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query('SELECT * FROM users WHERE deleted_at IS null', (err, result) => {
      connection.release();
      if (err) throw err;
      res.send(result);
    });
  });
}