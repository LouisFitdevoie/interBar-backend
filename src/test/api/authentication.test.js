const expect = require("chai").expect;

const {
  login,
  createUser,
} = require("../../api/controllers/authentication.controller.js");

before(function (done) {
  this.timeout(10000);
  setTimeout(done, 2000);
});
const server = require("../../main.js");
server.startServer();

describe("createUser", () => {
  it("should return an error if the email address is not provided", () => {
    const req = {
      body: {
        emailAddress: "",
        firstName: "First",
        lastName: "Last",
        password: "password",
        passwordConfirmation: "password",
        birthday: "01/01/1970",
      },
    };
    const res = {
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      send: function (response) {
        this.response = response;
      },
    };
    createUser(req, res);
    expect(res.statusCode).to.equal(400);
    expect(res.response).to.deep.equal({ error: "Invalid email address" });
  });

  it("should return an error if the email address is invalid", () => {
    const req = {
      body: {
        emailAddress: "invalid@email",
        firstName: "First",
        lastName: "Last",
        password: "password",
        passwordConfirmation: "password",
        birthday: "01/01/1970",
      },
    };
    const res = {
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      send: function (response) {
        this.response = response;
      },
    };
    createUser(req, res);
    expect(res.statusCode).to.equal(400);
    expect(res.response).to.deep.equal({ error: "Invalid email address" });
  });

  it("should return an error if the first name is not provided", () => {
    const req = {
      body: {
        emailAddress: "valid@email.com",
        firstName: "",
        lastName: "Last",
        password: "password",
        passwordConfirmation: "password",
        birthday: "01/01/1970",
      },
    };
    const res = {
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      send: function (response) {
        this.response = response;
      },
    };
    createUser(req, res);
    expect(res.statusCode).to.equal(400);
    expect(res.response).to.deep.equal({
      error: "Missing firstname or lastname",
    });
  });

  it("should return an error if the last name is not provided", () => {
    const req = {
      body: {
        emailAddress: "valid@email.com",
        firstName: "First",
        lastName: "",
        password: "password",
        passwordConfirmation: "password",
        birthday: "01/01/1970",
      },
    };
    const res = {
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      send: function (response) {
        this.response = response;
      },
    };
    createUser(req, res);
    expect(res.statusCode).to.equal(400);
    expect(res.response).to.deep.equal({
      error: "Missing firstname or lastname",
    });
  });
});

describe("login", () => {
  it("should return an error if the email address is not provided", () => {
    const req = {
      body: {
        emailAddress: "",
        password: "password",
      },
    };
    const res = {
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      send: function (response) {
        this.response = response;
      },
    };
    login(req, res);
    expect(res.statusCode).to.equal(400);
    expect(res.response).to.deep.equal({ error: "Invalid email address" });
  });

  it("should return an error if the email address is invalid", () => {
    const req = {
      body: {
        emailAddress: "invalid@email",
        password: "password",
      },
    };
    const res = {
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      send: function (response) {
        this.response = response;
      },
    };
    login(req, res);
    expect(res.statusCode).to.equal(400);
    expect(res.response).to.deep.equal({ error: "Invalid email address" });
  });

  it("should return an error if the password is not provided", () => {
    const req = {
      body: {
        emailAddress: "valid@email.com",
        password: "",
      },
    };
    const res = {
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      send: function (response) {
        this.response = response;
      },
    };
    login(req, res);
    expect(res.statusCode).to.equal(400);
    expect(res.response).to.deep.equal({ error: "Missing password" });
  });

  it("should return an error if the email address is not found in the database", () => {
    const req = {
      body: {
        emailAddress: "notfound@email.com",
        password: "password",
      },
    };
    const res = {
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      send: function (response) {
        this.response = response;
      },
    };
    login(req, res);
    expect(res.statusCode).to.equal(404);
    expect(res.response).to.deep.equal({
      error: "No user found for the email notfound@email.com",
    });
  });

  it("should return an error if the password is incorrect", () => {
    const req = {
      body: {
        emailAddress: "valid@email.com",
        password: "incorrect",
      },
    };
    const res = {
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      send: function (response) {
        this.response = response;
      },
    };
    login(req, res);
    expect(res.statusCode).to.equal(401);
    expect(res.response).to.deep.equal({ error: "Incorrect password" });
  });

  it("should return data if the email address and password are correct", () => {
    const req = {
      body: {
        emailAddress: "valid@email.com",
        password: "password",
      },
    };
    const res = {
      status: function (statusCode) {
        this.statusCode = statusCode;
        return this;
      },
      send: function (response) {
        this.response = response;
      },
    };
    login(req, res);
    expect(res.statusCode).to.equal(200);
    expect(res.message).to.deep.equal("User successfully logged in");
  });
});
