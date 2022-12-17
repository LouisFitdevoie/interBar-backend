const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();

chai.use(chaiHttp);

//REGARDER SUR CAPTURE D'ECRAN POUR SUPPRIMER LES DONNEES DE LA BASE DE DONNEES APRES LES TESTS

require("../../main.js").startServer();
before(function (done) {
  this.timeout(10000);
  setTimeout(done, 2000);
});
const serverAddress = `http://${process.env.API_HOST}:${process.env.API_PORT}`;
const baseURL = "/api/" + process.env.API_VERSION;

describe("Testing createUser function...", () => {
  it("should return an error if the email address is not provided", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-user")
      .send({
        emailAddress: "",
        firstName: "First",
        lastName: "Last",
        password: "password",
        passwordConfirmation: "password",
        birthday: "01/01/1970",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("error").eql("Invalid email address");
        done();
      });
  });
  it("should return an error if the email address is invalid", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-user")
      .send({
        emailAddress: "invalid@email",
        firstName: "First",
        lastName: "Last",
        password: "password",
        passwordConfirmation: "password",
        birthday: "01/01/1970",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("error").eql("Invalid email address");
        done();
      });
  });
  it("should return an error if the first name or last name is not provided", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-user")
      .send({
        emailAddress: "valid@email.com",
        password: "password",
        passwordConfirmation: "password",
        birthday: "01/01/1970",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have
          .property("error")
          .eql("Missing firstname or lastname");
        done();
      });
  });
  it("should return an error if the password is too short", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-user")
      .send({
        emailAddress: "valid@email.com",
        firstName: "First",
        lastName: "Last",
        password: "short",
        passwordConfirmation: "short",
        birthday: "01/01/1970",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have
          .property("error")
          .eql(
            "Invalid password. Password must be at least 8 characters and contains at least one letter, at least one number and at least one special character"
          );
        done();
      });
  });
  it("should return an error if the password does not meet the required complexity", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-user")
      .send({
        emailAddress: "valid@email.com",
        firstName: "First",
        lastName: "Last",
        password: "testingwithoutcomplexity",
        passwordConfirmation: "testingwithoutcomplexity",
        birthday: "01/01/1970",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have
          .property("error")
          .eql(
            "Invalid password. Password must be at least 8 characters and contains at least one letter, at least one number and at least one special character"
          );
        done();
      });
  });
  it("should return an error if the password and passwordConfirmation does not match", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-user")
      .send({
        emailAddress: "valid@email.com",
        firstName: "First",
        lastName: "Last",
        password: "ThisPassword123*",
        passwordConfirmation: "ThatPassword123*",
        birthday: "01/01/1970",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("error").eql("Passwords do not match");
        done();
      });
  });
  it("should return an error if the birthday is not a valid date", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-user")
      .send({
        emailAddress: "valid@email.com",
        firstName: "First",
        lastName: "Last",
        password: "Test123*",
        passwordConfirmation: "Test123*",
        birthday: "thisIsNotADate",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("error").eql("Invalid birthday");
        done();
      });
  });
  it("should return a success message if the user is created", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-user")
      .send({
        emailAddress: "valid@email.com",
        firstName: "First",
        lastName: "Last",
        password: "Test123*",
        passwordConfirmation: "Test123*",
        birthday: "01/01/1970",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have
          .property("message")
          .eql("User created successfully");
        done();
      });
  });
  it("should return an error if the email address is already in use", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-user")
      .send({
        emailAddress: "valid@email.com",
        firstName: "First",
        lastName: "Last",
        password: "Test123*",
        passwordConfirmation: "Test123*",
        birthday: "01/01/1970",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have
          .property("error")
          .eql("User account already exists for email address valid@email.com");
        done();
      });
  });
});

describe("Testing login function...", () => {
  it("should return an error if the email address is invalid", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/login")
      .send({
        emailAddress: "invalid@email",
        password: "password",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("error").eql("Invalid email address");
        done();
      });
  });
  it("should return an error if the password is missing", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/login")
      .send({
        emailAddress: "valid@email.com",
        password: "",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("error").eql("Missing password");
        done();
      });
  });
  it("should return an error if no account is found with the email provided", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/login")
      .send({
        emailAddress: "notExistingAccount@email.com",
        password: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.a("object");
        res.body.should.have
          .property("error")
          .eql("No users found for the email notExistingAccount@email.com");
        done();
      });
  });
  it("should return an error if the password provided is incorrect", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/login")
      .send({
        emailAddress: "valid@email.com",
        password: "Test1234*",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.should.have.property("error").eql("Invalid password");
        done();
      });
  });
  it("should return a success message, the correct user information and the correct access and refresh tokens when login is successfull", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/login")
      .send({
        emailAddress: "valid@email.com",
        password: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("object");
        res.body.should.have
          .property("message")
          .eql("User successfully logged in");
        res.body.should.have.property("user");
        res.body.user.should.be.a("object");
        res.body.user.should.have.property("id");
        res.body.user.should.have
          .property("emailAddress")
          .eql("valid@email.com");
        res.body.user.should.have.property("firstName").eql("First");
        res.body.user.should.have.property("lastName").eql("Last");
        res.body.user.should.have
          .property("birthday")
          .eql("1970-01-01 00:00:00.000");
        res.body.should.have.property("accessToken");
        res.body.should.have.property("refreshToken");
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
        connection.query("DELETE FROM Users", (err, result) => {
          if (err) throw err;
          connection.release();
          done();
        });
      });
    });
  } else {
    done();
  }
});
