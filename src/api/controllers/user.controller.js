const uuid = require("uuid");
const bcrypt = require("bcrypt");
const isValid = require("date-fns/isValid");
const parse = require("date-fns/parse");
var formatDistanceToNowStrict = require("date-fns/formatDistanceToNowStrict");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const database = require("../../database.js");
const pool = database.pool;
const emailRegex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);

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
    connection.query(
      "SELECT * FROM Users WHERE deleted_at IS null",
      (err, result) => {
        connection.release();
        if (err) throw err;
        res.send(result);
      }
    );
  });
};
exports.getUserWithId = (req, res) => {
  if (uuid.validate(req.query.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      if (process.env.NODE_ENV !== "testing")
        console.log(`Getting user with id ${req.query.id}`);
      connection.query(
        "SELECT * FROM Users WHERE id = ? AND deleted_at IS null",
        [req.query.id],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            if (process.env.NODE_ENV !== "testing")
              console.log("Number of users found: " + result.length + "");
            res.send(result);
          } else {
            if (process.env.NODE_ENV !== "testing")
              console.log("No users found");
            res
              .status(404)
              .send({ error: "No users found for the id " + req.query.id });
          }
        }
      );
    });
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log(`Invalid user id ${req.query.id}`);
    res.status(400).send({
      error: "Invalid user id, " + req.query.id + " is not a valid uuid",
    });
  }
};
exports.getUserWithName = (req, res) => {
  if (
    req.query.firstName.trim().length > 0 &&
    req.query.lastName.trim().length > 0
  ) {
    pool.getConnection((err, connection) => {
      connection.query(
        "SELECT * FROM Users WHERE firstname LIKE ? AND lastname LIKE ? AND deleted_at IS null",
        [
          "%" + req.query.firstName.trim() + "%",
          "%" + req.query.lastName.trim() + "%",
        ],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            if (process.env.NODE_ENV !== "testing")
              console.log("Number of users found: " + result.length + "");
            res.send(result);
          } else {
            if (process.env.NODE_ENV !== "testing")
              console.log("No users found");
            res.status(404).send({
              error:
                "No users found for the name " +
                req.query.firstName +
                " " +
                req.query.lastName,
            });
          }
        }
      );
    });
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log("Missing firstname or lastname");
    res.status(400).send({ error: "Missing firstname or lastname" });
  }
};
exports.getUserWithEmail = (req, res) => {
  if (
    req.body.emailAddress.trim().length > 0 &&
    emailRegex.test(req.body.emailAddress.trim())
  ) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT * FROM Users WHERE emailAddress = ? AND deleted_at IS null",
        [req.body.emailAddress.trim()],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            if (process.env.NODE_ENV !== "testing")
              console.log("Number of users found: " + result.length + "");
            res.send(result);
          } else {
            if (process.env.NODE_ENV !== "testing")
              console.log("No users found");
            res.status(404).send({
              error: "No users found for the email " + req.body.emailAddress,
            });
          }
        }
      );
    });
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log("Invalid email address");
    res.status(400).send({ error: "Invalid email address" });
  }
};

exports.updateUser = (req, res) => {
  if (uuid.validate(req.body.id)) {
    if (
      process.env.NODE_ENV === "testing" ||
      jwt.decode(req.headers.authorization.split(" ")[1]).id === req.body.id
    ) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "SELECT firstname, lastname, birthday FROM Users WHERE id = ? AND deleted_at IS null",
          [req.body.id],
          (err, result) => {
            if (err) throw err;
            if (result.length === 1) {
              let birthday;
              if (req.body.birthday) {
                birthday = req.body.birthday;
                birthday = parse(birthday, "dd/MM/yyyy", new Date());
                if (!isValid(birthday)) {
                  if (process.env.NODE_ENV !== "testing")
                    console.log("Invalid birthday");
                  res.status(400).send({ error: "Invalid birthday" });
                }
              }
              let dataToEdit = [
                req.body.firstName != undefined &&
                req.body.firstName.trim() != result[0].firstname
                  ? true
                  : false,
                req.body.lastName != undefined &&
                req.body.lastName.trim() != result[0].lastname
                  ? true
                  : false,
                birthday != undefined && birthday != result[0].birthday
                  ? true
                  : false,
              ];
              if (dataToEdit.includes(true)) {
                let sql = "UPDATE Users SET ";
                let arrayOfEdition = [];
                if (dataToEdit[0]) {
                  arrayOfEdition.push(req.body.firstName.trim());
                  if (dataToEdit[1] || dataToEdit[2]) {
                    sql += "firstname = ?, ";
                  } else {
                    sql += "firstname = ?";
                  }
                }
                if (dataToEdit[1]) {
                  arrayOfEdition.push(req.body.lastName.trim());
                  if (dataToEdit[2]) {
                    sql += "lastname = ?, ";
                  } else {
                    sql += "lastname = ?";
                  }
                }
                if (dataToEdit[2]) {
                  arrayOfEdition.push(birthday);
                  sql += "birthday = ?";
                }
                sql += " WHERE id = ? AND deleted_at IS null";
                arrayOfEdition.push(req.body.id);
                connection.query(sql, arrayOfEdition, (err, result) => {
                  connection.release();
                  if (err) throw err;
                  if (process.env.NODE_ENV !== "testing")
                    console.log("User updated");
                  res.send({ success: "User updated" });
                });
              } else {
                connection.release();
                if (process.env.NODE_ENV !== "testing")
                  console.log("Nothing to update");
                res.send({ success: "Nothing to update" });
              }
            } else {
              if (process.env.NODE_ENV !== "testing")
                console.log("No user found");
              res
                .status(404)
                .send({ error: "No user found for the id " + req.body.id });
            }
          }
        );
      });
    } else {
      if (process.env.NODE_ENV !== "testing")
        console.log("You can't edit another user's personal data");
      res
        .status(400)
        .send({ error: "You can't edit another user's personal data" });
    }
  } else {
    if (process.env.NODE_ENV !== "testing") console.log("Invalid id");
    res.status(400).send({ error: "Invalid id" });
  }
};
exports.updateUserPassword = (req, res) => {
  if (
    process.env.NODE_ENV === "testing" ||
    jwt.decode(req.headers.authorization.split(" ")[1]).id === req.body.id
  ) {
    if (
      req.body.newPassword.trim().length > 7 &&
      req.body.newPassword
        .trim()
        .match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)
    ) {
      if (
        req.body.newPasswordConfirmation.trim() === req.body.newPassword.trim()
      ) {
        if (req.body.oldPassword.trim().length > 0) {
          pool.getConnection((err, connection) => {
            if (err) throw err;
            let passwordHashed = bcrypt.hashSync(
              req.body.newPassword.trim(),
              10
            );
            connection.query(
              "SELECT password FROM Users WHERE id = ? AND deleted_at IS null",
              [req.body.id],
              (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                  if (
                    bcrypt.compareSync(
                      req.body.oldPassword.trim(),
                      result[0].password
                    ) &&
                    !bcrypt.compareSync(
                      req.body.newPassword.trim(),
                      result[0].password
                    )
                  ) {
                    connection.query(
                      "UPDATE Users SET password = ? WHERE id = ? AND deleted_at IS null",
                      [passwordHashed, req.body.id],
                      (err, result) => {
                        connection.release();
                        if (err) throw err;
                        if (process.env.NODE_ENV !== "testing")
                          console.log("Password updated");
                        res.send({ success: "Password updated" });
                      }
                    );
                  } else {
                    connection.release();
                    if (process.env.NODE_ENV !== "testing")
                      console.log("Invalid old password");
                    res.status(400).send({ error: "Invalid old password" });
                  }
                } else {
                  if (process.env.NODE_ENV !== "testing")
                    console.log("No users found");
                  res.status(404).send({
                    error: "No users found for the id " + req.body.id,
                  });
                }
              }
            );
          });
        } else {
          if (process.env.NODE_ENV !== "testing")
            console.log("Missing old password");
          res.status(400).send({ error: "Missing old password" });
        }
      } else {
        if (process.env.NODE_ENV !== "testing")
          console.log("New password confirmation does not match new password");
        res.status(400).send({
          error: "New password confirmation does not match new password",
        });
      }
    } else {
      if (process.env.NODE_ENV !== "testing") console.log("Invalid password");
      res.status(400).send({
        error:
          "Invalid password. Password must be at least 8 characters and contains at least one letter, at least one number and at least one special character",
      });
    }
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log("You can't edit another user's password");
    res.status(400).send({ error: "You can't edit another user's password" });
  }
};
exports.deleteUser = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      let randomString = uuid.v4().replace(/-/g, "");
      const emailAnonymized = "anonymous." + randomString + "@anonymized.com";
      const randomPassword = uuid.v4().replace(/-/g, "");
      connection.query(
        "UPDATE Users SET emailaddress = ?, firstname = ?, lastname = ?, password = ?, deleted_at = NOW() WHERE id = ?",
        [
          emailAnonymized,
          "Anonymous",
          randomString,
          randomPassword,
          req.params.id,
        ],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (process.env.NODE_ENV !== "testing")
            console.log("User deleted and anonymized");
          res.status(200).send({ success: "User deleted successfully" });
        }
      );
    });
  } else {
    if (process.env.NODE_ENV !== "testing") console.log("Invalid id");
    res.status(400).send({ error: "Invalid id" });
  }
};
exports.isUserAdult = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      connection.query(
        "SELECT birthday FROM Users WHERE id = ? AND deleted_at IS null",
        [req.params.id],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length === 1) {
            let birthday = new Date(result[0].birthday);
            let age = formatDistanceToNowStrict(birthday, {
              unit: "year",
              roundingMethod: "floor",
            });
            age = parseInt(age.split(" ")[0])
              ? parseInt(age.split(" ")[0])
              : undefined;
            if (age != undefined) {
              res
                .status(200)
                .send({ message: "User is " + age + " years old", age: age });
            } else {
              res.status(400).send({ error: "Invalid birthday" });
            }
          } else {
            if (process.env.NODE_ENV !== "testing")
              console.log("No user found");
            res
              .status(404)
              .send({ error: "No user found for the id " + req.params.id });
          }
        }
      );
    });
  } else {
    if (process.env.NODE_ENV !== "testing") console.log("Invalid id");
    res.status(400).send({ error: "Invalid id" });
  }
};
