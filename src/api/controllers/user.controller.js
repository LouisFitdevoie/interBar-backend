const uuid = require('uuid');
const database = require('../../database.js');
const pool = database.pool;
const bcrypt = require('bcrypt');
const emailRegex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
const isValid = require('date-fns/isValid');
const parse = require('date-fns/parse');
var formatDistanceToNowStrict = require('date-fns/formatDistanceToNowStrict')

class User {
  constructor(emailAddress, firstName, lastName, birthday, password) {
    this.emailAddress = emailAddress;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthday = birthday;
    this.password = password;
  }
  id = uuid.v4();
  emailAddress;
  firstName;
  lastName;
  birthday;
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

exports.createUser = (req, res) => {
  if (req.body.emailAddress.trim().length > 0 && emailRegex.test(req.body.emailAddress.trim())) {
    if (req.body.firstName != undefined && req.body.lastName != undefined && req.body.firstName.trim().length > 0 && req.body.lastName.trim().length > 0) {
      if (req.body.password.trim().length > 7 && req.body.password.trim().match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)) {
        if (req.body.passwordConfirmation && req.body.passwordConfirmation.trim() === req.body.password.trim()) {
          const parsedBirthday = parse(req.body.birthday, 'dd/MM/yyyy', new Date());
          const isValidDate = isValid(parsedBirthday);
          if (isValidDate) {
            pool.getConnection((err, connection) => {
              if (err) throw err;
              let passwordHashed = bcrypt.hashSync(req.body.password.trim(), 10);
              connection.query('SELECT id FROM users WHERE emailAddress = ? AND deleted_at IS null', [req.body.emailAddress], (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                  console.log('User account already exists for email address ' + req.body.emailAddress);
                  res.status(400).send({ 'error': 'User account already exists for email address ' + req.body.emailAddress });
                } else {
                  connection.query('SELECT id FROM users WHERE firstname = ? AND lastname = ? AND deleted_at IS null', [req.body.firstName, req.body.lastName], (err, result) => {
                    if (err) throw err;
                    if (result.length > 0) {
                      console.log('User account already exists for name ' + req.body.firstName + ' ' + req.body.lastName);
                      res.status(400).send({ 'error': 'User account already exists for name ' + req.body.firstName + ' ' + req.body.lastName });
                    } else {
                      let userToCreate = new User(req.body.emailAddress.trim(), req.body.firstName.trim(), req.body.lastName.trim(), parsedBirthday, passwordHashed);
                      connection.query('INSERT INTO users (id, emailaddress, firstname, lastname, birthday, password, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [userToCreate.id, userToCreate.emailAddress, userToCreate.firstName, userToCreate.lastName, userToCreate.birthday, userToCreate.password, userToCreate.deleted_at], (err, result) => {
                        connection.release();
                        if (err) throw err;
                        console.log('User created');
                        res.send(userToCreate);
                      });
                    }
                  });
                }
              });
            });
          } else {
            console.log('Invalid birthday');
            res.status(400).send({ 'error': 'Invalid birthday' });
          }
        } else {
          console.log('Passwords do not match');
          res.status(400).send({ 'error': 'Passwords do not match' });
        }
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
  if (uuid.validate(req.body.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT firstname, lastname, birthday FROM users WHERE id = ? AND deleted_at IS null', [req.body.id], (err, result) => {
        if (err) throw err;
        if (result.length === 1) {
          let birthday;
          if (req.body.birthday) {
            birthday = req.body.birthday;
            birthday = parse(birthday, 'dd/MM/yyyy', new Date());
            if (!isValid(birthday)) {
              console.log('Invalid birthday');
              res.status(400).send({ 'error': 'Invalid birthday' });
            }
          }
          let dataToEdit = [
            (req.body.firstName != undefined && req.body.firstName.trim() != result[0].firstname) ? true : false,
            (req.body.lastName != undefined && req.body.lastName.trim() != result[0].lastname) ? true : false,
            (birthday != undefined && birthday != result[0].birthday) ? true : false
          ];
          console.log(dataToEdit);
          if (dataToEdit.includes(true)) {
            let sql = 'UPDATE users SET ';
            let arrayOfEdition = [];
            if (dataToEdit[0]) {
              arrayOfEdition.push(req.body.firstName.trim());
              if (dataToEdit[1] || dataToEdit[2]) {
                sql += 'firstname = ?, ';
              } else {
                sql += 'firstname = ?';
              }
            }
            if (dataToEdit[1]) {
              arrayOfEdition.push(req.body.lastName.trim());
              if (dataToEdit[2]) {
                sql += 'lastname = ?, ';
              } else {
                sql += 'lastname = ?';
              }
            }
            if (dataToEdit[2]) {
              arrayOfEdition.push(birthday);
              sql += 'birthday = ?';
            }
            sql += ' WHERE id = ? AND deleted_at IS null';
            arrayOfEdition.push(req.body.id);
            console.log('ici');
            connection.query(sql, arrayOfEdition, (err, result) => {
              connection.release();
              if (err) throw err;
              console.log('User updated');
              res.send({ 'success': 'User updated' });
            });
          } else {
            connection.release();
            console.log('Nothing to update');
            res.send({ 'success': 'Nothing to update' });
          }
        } else {
          console.log('No user found');
          res.status(404).send({ 'error': 'No user found for the id ' + req.body.id });
        }
      });
    });
  } else {
    console.log('Invalid id');
    res.status(400).send({ 'error': 'Invalid id' });
  }
}
exports.updateUserPassword = (req, res) => {
  if (req.body.newPassword.trim().length > 7 && req.body.newPassword.trim().match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)) {
    if (req.body.newPasswordConfirmation.trim() === req.body.newPassword.trim()) {
      if (req.body.oldPassword.trim().length > 0) {
        pool.getConnection((err, connection) => {
          if (err) throw err;
          let passwordHashed = bcrypt.hashSync(req.body.newPassword.trim(), 10);
          connection.query('SELECT password FROM users WHERE id = ? AND deleted_at IS null', [req.body.id], (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
              if (bcrypt.compareSync(req.body.oldPassword.trim(), result[0].password) && !bcrypt.compareSync(req.body.newPassword.trim(), result[0].password)) {
                connection.query('UPDATE users SET password = ? WHERE id = ? AND deleted_at IS null', [passwordHashed, req.body.id], (err, result) => {
                  connection.release();
                  if (err) throw err;
                  console.log('Password updated');
                  res.send({ 'message': 'Password updated' });
                });
              } else {
                connection.release();
                console.log('Invalid old password');
                res.status(400).send({ 'error': 'Invalid old password' });
              }
            } else {
              console.log('No users found');
              res.status(404).send({ 'error': 'No users found for the id ' + req.body.id });
            }
          });
        });
      } else {
        console.log('Missing old password');
        res.status(400).send({ 'error': 'Missing old password' });
      }
    } else {
      console.log('New password confirmation does not match new password');
      res.status(400).send({ 'error': 'New password confirmation does not match new password' });
    }
  } else {
    console.log('Invalid password');
    res.status(400).send({ 'error': 'Invalid password. Password must be at least 8 characters and contains at least one letter, at least one number and at least one special character' });
  }
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
exports.isUserAdult = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      connection.query('SELECT birthday FROM users WHERE id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
        connection.release();
        if (err) throw err;
        if (result.length === 1) {
          let birthday = new Date(result[0].birthday);
          let age = formatDistanceToNowStrict(birthday, { unit: 'year', roundingMethod: 'floor' });
          age = parseInt(age.split(' ')[0]) ? parseInt(age.split(' ')[0]) : undefined;
          if (age != undefined) {
            res.status(200).send({ "message": "User is " + age + " years old", "age": age });
          } else {
            res.status(400).send({ "error": "Invalid birthday" });
          }
        } else {
          console.log('No user found');
          res.status(404).send({ 'error': 'No user found for the id ' + req.params.id });
        }
      });
    });
  } else {
    console.log('Invalid id');
    res.status(400).send({ 'error': 'Invalid id' });
  }
}