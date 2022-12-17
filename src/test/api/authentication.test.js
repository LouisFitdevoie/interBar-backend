const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();

chai.use(chaiHttp);

const {
  login,
  createUser,
} = require("../../api/controllers/authentication.controller.js");

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
