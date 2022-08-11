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
  id = uuid.va4();
  emailAddress;
  firstName;
  lastName;
  password;
  deleted_at = null;
}