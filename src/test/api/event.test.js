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
let eventIdCreated = "";

describe("Testing createEvent function...", () => {
  it("should return an error message if start date is before current date", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event")
      .send({
        name: "Event test",
        startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
        endDate: new Date(),
        location: "Event location",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        seller_password: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("Start date is before current date");
        done();
      });
  });
  it("should return an error message if end date is before start date", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event")
      .send({
        name: "Event test",
        startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        location: "Event location",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        seller_password: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("End date is before start date");
        done();
      });
  });
  it("should return an error message if the name is not provided", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event")
      .send({
        name: "",
        startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        location: "Event location",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        seller_password: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("Name is required");
        done();
      });
  });
  it("should return an error message if the location is not provided", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event")
      .send({
        name: "Event test",
        startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        location: "",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        seller_password: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("No location specified");
        done();
      });
  });
  it("should return an error if the seller password is not specified or does not complete the required complexity", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event")
      .send({
        name: "Event test",
        startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        location: "Event location",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        seller_password: "test",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Seller password not specified");
        done();
      });
  });
  const startDate = new Date(
    new Date().setDate(new Date().getDate() + 1)
  ).toISOString();
  const endDate = new Date(
    new Date().setDate(new Date().getDate() + 2)
  ).toISOString();
  it("should return a success message if the event is created", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event")
      .send({
        name: "Event test",
        startDate: startDate,
        endDate: endDate,
        location: "Event location",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        seller_password: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Event created successfully");
        res.body.should.have.property("eventId");
        eventIdCreated = res.body.eventId;
        done();
      });
  });
  it("should return an error message if the event already exists", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event")
      .send({
        name: "Event test",
        startDate: startDate,
        endDate: endDate,
        location: "Event location",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        seller_password: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Event already exists");
        done();
      });
  });
});

describe("Testing getEventById function...", () => {
  it("should return an error message if the provided id is invalid", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/eventId?id=invalidId")
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Invalid id, invalidId is not a valid uuid"
        );
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
          connection.query("DELETE FROM Products", (err, result) => {
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
  } else {
    done();
  }
});
