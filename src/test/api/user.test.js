const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();

chai.use(chaiHttp);

before(function (done) {
  this.timeout(10000);
  setTimeout(done, 2000);
});
const serverAddress = `http://${process.env.API_HOST}:${process.env.API_PORT}`;
const baseURL = "/api/" + process.env.API_VERSION;

let userCreatedId = "";

describe("PUT /update-user", () => {
  it("should return an error message if the id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-user")
      .send({
        id: "invalidId",
        firstName: "John",
        lastName: "Doe",
        birthday: "01/01/1990",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Invalid id");
        done();
      });
  });
  it("should return an error if no user exists with the id provided", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-user")
      .send({
        id: "00000000-0000-0000-0000-000000000000",
        firstName: "John",
        lastName: "Doe",
        birthday: "01/01/1990",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "No user found for the id 00000000-0000-0000-0000-000000000000"
        );
        done();
      });
  });
  it("should return a success message if no data is provided", (done) => {
    //First need to create a user
    chai
      .request(serverAddress)
      .post(baseURL + "/create-user")
      .send({
        emailAddress: "john.doe@testing.lan",
        firstName: "John",
        lastName: "Doe",
        password: "Test123*",
        passwordConfirmation: "Test123*",
        birthday: "01/01/1990",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have
          .property("message")
          .eql("User created successfully");
        res.body.should.have.property("userCreated");
        userCreatedId = res.body.userCreated.id;
        chai
          .request(serverAddress)
          .put(baseURL + "/update-user")
          .send({
            id: userCreatedId,
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property("success");
            res.body.success.should.equal("Nothing to update");
            done();
          });
      });
  });
  it("should return an success message if the user is updated", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-user")
      .send({
        id: userCreatedId,
        firstName: "Johnny",
        lastName: "Doey",
        birthday: "02/02/1992",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("User updated");
        done();
      });
  });
});

describe("PUT /update-user-password", () => {
  it("should return an error message if the new password is invalid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-user-password")
      .send({
        id: userCreatedId,
        oldPassword: "Test123*",
        newPassword: "invalid",
        newPasswordConfirmation: "invalid",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Invalid password. Password must be at least 8 characters and contains at least one letter, at least one number and at least one special character"
        );
        done();
      });
  });
  it("should return an error message if the new password and password confirmation do not match", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-user-password")
      .send({
        id: userCreatedId,
        oldPassword: "Test123*",
        newPassword: "Test1234*",
        newPasswordConfirmation: "NotTheSame",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "New password confirmation does not match new password"
        );
        done();
      });
  });
  it("should return an error message if the old password is not provided", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-user-password")
      .send({
        id: userCreatedId,
        oldPassword: "",
        newPassword: "Test1234*",
        newPasswordConfirmation: "Test1234*",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Missing old password");
        chai
          .request(serverAddress)
          .put(baseURL + "/update-user-password")
          .send({
            id: "invalidId",
            oldPassword: "Test123*",
            newPassword: "Test1234*",
            newPasswordConfirmation: "Test1234*",
          })
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.have.property("error");
            res.body.error.should.equal("No users found for the id invalidId");
            done();
          });
      });
  });
  it("should return an error message if the old password provided is incorrect", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-user-password")
      .send({
        id: userCreatedId,
        oldPassword: "WrongPassword123*",
        newPassword: "Test1234*",
        newPasswordConfirmation: "Test1234*",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Invalid old password");
        done();
      });
  });
  it("should return a success message if the password is updated", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-user-password")
      .send({
        id: userCreatedId,
        oldPassword: "Test123*",
        newPassword: "Test1234*",
        newPasswordConfirmation: "Test1234*",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Password updated");
        done();
      });
  });
});

describe("PUT /delete-user/{userId}", () => {
  it("should return an error message if the id provided is invalid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/delete-user/invalidId")
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Invalid id");
        done();
      });
  });
  it("should return a success message if the user is successfully deleted", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/delete-user/" + userCreatedId)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("User deleted successfully");
        done();
      });
  });
});

after((done) => {
  const database = require("../../database.js");
  const pool = database.pool;
  process.env.TEST_FILES_COMPLETED++;
  if (process.env.TEST_FILES_COMPLETED === process.env.TEST_FILES_TOTAL) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query("DELETE FROM RefreshTokens", (err, result) => {
        if (err) throw err;
        connection.query(
          "DELETE FROM EventsProductsCommands",
          (err, result) => {
            if (err) throw err;
            connection.query("DELETE FROM EventsProducts", (err, result) => {
              if (err) throw err;
              connection.query("DELETE FROM Products", (err, result) => {
                if (err) throw err;
                connection.query("DELETE FROM Commands", (err, result) => {
                  if (err) throw err;
                  connection.query("DELETE FROM UsersEvents", (err, result) => {
                    if (err) throw err;
                    connection.query("DELETE FROM Users", (err, result) => {
                      if (err) throw err;
                      connection.query("DELETE FROM Events", (err, result) => {
                        if (err) throw err;
                        connection.release();
                        done();
                      });
                    });
                  });
                });
              });
            });
          }
        );
      });
    });
  } else {
    done();
  }
});
