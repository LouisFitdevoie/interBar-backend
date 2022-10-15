const uuid = require("uuid");
const bcrypt = require("bcrypt");
const isValid = require("date-fns/isValid");
const parse = require("date-fns/parse");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const database = require("../../database.js");
const pool = database.pool;
const emailRegex = new RegExp(
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
);

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

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

exports.login = (req, res) => {
  if (
    req.body.emailAddress.trim().length > 0 &&
    emailRegex.test(req.body.emailAddress.trim())
  ) {
    if (req.body.password.trim().length > 0) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "SELECT * FROM users WHERE emailAddress = ? AND deleted_at IS null",
          [req.body.emailAddress.trim()],
          (err, result) => {
            if (err) res.status(400).send({ error: "Invalid email address" });
            if (result.length > 0) {
              if (
                bcrypt.compareSync(req.body.password.trim(), result[0].password)
              ) {
                const userToLogin = {
                  firstName: result[0].firstname,
                  lastName: result[0].lastname,
                  emailAddress: result[0].emailaddress,
                  birthday: result[0].birthday,
                  id: result[0].id,
                };
                const accessToken = generateAccessToken(userToLogin);
                const refreshToken = jwt.sign(
                  userToLogin,
                  process.env.REFRESH_TOKEN_SECRET
                );
                connection.query(
                  "INSERT INTO refresh_tokens (token, user_id) VALUES (?, ?)",
                  [refreshToken, result[0].id],
                  (err, result) => {
                    connection.release();
                    if (err) throw err;
                    console.log("User successfully logged in");
                    res.json({
                      success: true,
                      statusCode: 200,
                      message: "User successfully logged in",
                      accessToken: accessToken,
                      refreshToken: refreshToken,
                      user: {
                        firstName: userToLogin.firstName,
                        lastName: userToLogin.lastName,
                        emailAddress: userToLogin.emailAddress,
                        birthday: userToLogin.birthday,
                        id: userToLogin.id,
                      },
                    });
                  }
                );
              } else {
                console.log("Invalid password");
                res.status(400).send({ error: "Invalid password" });
              }
            } else {
              console.log("No users found");
              res.status(404).send({
                error: "No users found for the email " + req.body.emailAddress,
              });
            }
          }
        );
      });
    } else {
      console.log("Missing password");
      res.status(400).send({ error: "Missing password" });
    }
  } else {
    console.log("Invalid email address");
    res.status(400).send({ error: "Invalid email address" });
  }
};

exports.updateToken = (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "SELECT * FROM refresh_tokens WHERE token = ?",
      [refreshToken],
      (err, result) => {
        connection.release();
        if (err) throw err;
        if (!result) return res.sendStatus(403);
        const user = jwt.decode(req.body.token);
        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          (err, user) => {
            if (err) return res.sendStatus(403);
            const accessToken = generateAccessToken(user);
            res.json({ accessToken: accessToken });
          }
        );
      }
    );
  });
};

exports.logout = (req, res) => {
  const refreshToken = req.body.token;
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "DELETE FROM refresh_tokens WHERE token = ?",
      [refreshToken],
      (err, result) => {
        connection.release();
        if (err) throw err;
        res.status(204).send("User successfully logged out");
      }
    );
  });
};

exports.createUser = (req, res) => {
  //Verifying email address
  if (
    req.body.emailAddress.trim().length > 0 &&
    emailRegex.test(req.body.emailAddress.trim())
  ) {
    //Verifying first name and last name
    if (
      req.body.firstName != undefined &&
      req.body.lastName != undefined &&
      req.body.firstName.trim().length > 0 &&
      req.body.lastName.trim().length > 0
    ) {
      //Verifying password is min 8 characters
      if (
        req.body.password.trim().length > 7 &&
        req.body.password
          .trim()
          .match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/)
      ) {
        //Verifying password and password confirmation match
        if (
          req.body.passwordConfirmation &&
          req.body.passwordConfirmation.trim() === req.body.password.trim()
        ) {
          const parsedBirthday = parse(
            req.body.birthday,
            "dd/MM/yyyy",
            new Date()
          );
          const isValidDate = isValid(parsedBirthday);
          //Verifying birthday is valid
          if (isValidDate) {
            pool.getConnection((err, connection) => {
              if (err) throw err;
              let passwordHashed = bcrypt.hashSync(
                req.body.password.trim(),
                10
              );
              connection.query(
                "SELECT id FROM users WHERE emailAddress = ? AND deleted_at IS null",
                [req.body.emailAddress],
                (err, result) => {
                  if (err) throw err;
                  if (result.length > 0) {
                    console.log(
                      "User account already exists for email address " +
                        req.body.emailAddress
                    );
                    res.status(400).send({
                      error:
                        "User account already exists for email address " +
                        req.body.emailAddress,
                    });
                  } else {
                    connection.query(
                      "SELECT id FROM users WHERE firstname = ? AND lastname = ? AND deleted_at IS null",
                      [req.body.firstName, req.body.lastName],
                      (err, result) => {
                        if (err) throw err;
                        if (result.length > 0) {
                          console.log(
                            "User account already exists for name " +
                              req.body.firstName +
                              " " +
                              req.body.lastName
                          );
                          res.status(400).send({
                            error:
                              "User account already exists for name " +
                              req.body.firstName +
                              " " +
                              req.body.lastName,
                          });
                        } else {
                          let userToCreate = new User(
                            req.body.emailAddress.trim(),
                            req.body.firstName.trim(),
                            req.body.lastName.trim(),
                            parsedBirthday,
                            passwordHashed
                          );
                          connection.query(
                            "INSERT INTO users (id, emailaddress, firstname, lastname, birthday, password, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                            [
                              userToCreate.id,
                              userToCreate.emailAddress,
                              userToCreate.firstName,
                              userToCreate.lastName,
                              userToCreate.birthday,
                              userToCreate.password,
                              userToCreate.deleted_at,
                            ],
                            (err, result) => {
                              connection.release();
                              if (err) throw err;
                              console.log("User created");
                              res.json({
                                success: true,
                                statusCode: 200,
                                message: "User created successfully",
                                userCreated: userToCreate,
                              });
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            });
          } else {
            console.log("Invalid birthday");
            res.status(400).send({ error: "Invalid birthday" });
          }
        } else {
          console.log("Passwords do not match");
          res.status(400).send({ error: "Passwords do not match" });
        }
      } else {
        console.log("Invalid password");
        res.status(400).send({
          error:
            "Invalid password. Password must be at least 8 characters and contains at least one letter, at least one number and at least one special character",
        });
      }
    } else {
      console.log("Missing firstname or lastname");
      res.status(400).send({ error: "Missing firstname or lastname" });
    }
  } else {
    console.log("Invalid email address");
    res.status(400).send({ error: "Invalid email address" });
  }
};
