const uuid = require('uuid');
const database = require('../../database.js');
const pool = database.pool;
const bcrypt = require('bcrypt');
const emailRegex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

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
exports.getUserWithEmail = (req, res) => {
  if (req.body.emailAddress.trim().length > 0 && emailRegex.test(req.body.emailAddress.trim())) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT * FROM users WHERE emailAddress = ? AND deleted_at IS null', [req.body.emailAddress.trim()], (err, result) => {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          console.log('Number of users found: ' + result.length + '');
          res.send(result);
        } else {
          console.log('No users found');
          res.status(404).send({ 'error': 'No users found for the email ' + req.body.emailAddress });
        }
      });
    });
  } else {
    console.log('Invalid email address');
    res.status(400).send({ 'error': 'Invalid email address' });
  }
}

//ADD VERIFICATION OF CONFIRM PASSWORD

exports.createUser = (req, res) => {
  if (req.body.emailAddress.trim().length > 0 && emailRegex.test(req.body.emailAddress.trim())) {
    if (req.body.firstName != undefined && req.body.lastName != undefined && req.body.firstName.trim().length > 0 && req.body.lastName.trim().length > 0) {
      if (req.body.password.trim().length > 7 && req.body.password.trim().match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)) {
        pool.getConnection((err, connection) => {
          if (err) throw err;
          let passwordHashed = bcrypt.hashSync(req.body.password.trim(), 10);
          let userToCreate = new User(req.body.emailAddress.trim(), req.body.firstName.trim(), req.body.lastName.trim(), passwordHashed);
          connection.query('INSERT INTO users (id, emailaddress, firstname, lastname, password, deleted_at) VALUES (?, ?, ?, ?, ?, ?)', [userToCreate.id, userToCreate.emailAddress, userToCreate.firstName, userToCreate.lastName, userToCreate.password, userToCreate.deleted_at], (err, result) => {
            connection.release();
            if (err) throw err;
            console.log('User created');
            res.send(userToCreate);
          });
        });
      } else {
        console.log('Invalid password');
        res.status(400).send({ 'error': 'Invalid password. Password must be at least 8 characters and contains at least one letter, at least one number and at least one special character' });
      }
    } else {
      console.log('Missing firstname or lastname');
      res.status(400).send({ 'error': 'Missing firstname or lastname' });
    }
  } else {
    console.log('Invalid email address');
    res.status(400).send({ 'error': 'Invalid email address' });
  }
}
exports.updateUser = (req, res) => {

}
exports.updateUserPassword = (req, res) => {

}
exports.login = (req, res) => {
  if (req.body.emailAddress.trim().length > 0 && emailRegex.test(req.body.emailAddress.trim())) {
    if (req.body.password.trim().length > 0) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT * FROM users WHERE emailAddress = ? AND deleted_at IS null', [req.body.emailAddress.trim()], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            if (bcrypt.compareSync(req.body.password.trim(), result[0].password)) {
              console.log('User logged in');
              res.status(200).send({ "message": "User logged in" });
            } else {
              console.log('Invalid password');
              res.status(400).send({ 'error': 'Invalid password' });
            }
          } else {
            console.log('No users found');
            res.status(404).send({ 'error': 'No users found for the email ' + req.body.emailAddress });
          }
        });
      });
    } else {
      console.log('Missing password');
      res.status(400).send({ 'error': 'Missing password' });
    }
  } else {
    console.log('Invalid email address');
    res.status(400).send({ 'error': 'Invalid email address' });
  }
}
exports.deleteUser = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [req.params.id], (err, result) => {
        connection.release();
        if (err) throw err;
        console.log('User deleted');
        res.send({ "message": "User deleted" });
      }
      );
    });
  } else {
    console.log('Invalid id');
    res.status(400).send({ 'error': 'Invalid id' });
  }
}