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
exports.getUserWithId = (req, res) => {
  if (uuid.validate(req.query.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting user with id ${req.query.id}`);
      connection.query('SELECT * FROM users WHERE id = ? AND deleted_at IS null', [req.query.id], (err, result) => {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          console.log('Number of users found: ' + result.length + '');
          res.send(result);
        } else {
          console.log('No users found');
          res.status(404).send({ 'error': 'No users found for the id ' + req.query.id });
        }
      });
    });
  } else {
    console.log(`Invalid user id ${req.query.id}`);
    res.status(400).send({ 'error': 'Invalid user id, ' + req.query.id + ' is not a valid uuid' });
  }
}
exports.getUserWithName = (req, res) => {
  if (req.query.firstName.trim().length > 0 && req.query.lastName.trim().length > 0) {
    pool.getConnection((err, connection) => {
      connection.query('SELECT * FROM users WHERE firstname LIKE ? AND lastname LIKE ? AND deleted_at IS null', ['%' + req.query.firstName.trim() + '%', '%' + req.query.lastName.trim() + '%'], (err, result) => {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          console.log('Number of users found: ' + result.length + '');
          res.send(result);
        } else {
          console.log('No users found');
          res.status(404).send({ 'error': 'No users found for the name ' + req.query.firstName + ' ' + req.query.lastName });
        }
      });
    });
  } else {
    console.log('Missing firstname or lastname');
    res.status(400).send({ 'error': 'Missing firstname or lastname' });
  }
}