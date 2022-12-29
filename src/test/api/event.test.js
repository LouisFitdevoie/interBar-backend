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

const startDate = new Date(
  new Date().setDate(new Date().getDate() + 1)
).toISOString();
const startNowDate = new Date(
  new Date().setSeconds(new Date().getSeconds() + 11) //IF ERROR DURING THE TEST FOR CREATING AN EVENT WITH START DATE NOW, EDIT THE NUMBER OF SECONDS TO ADD
).toISOString();
const endDate = new Date(
  new Date().setDate(new Date().getDate() + 2)
).toISOString();
let eventIdCreated = new Array(3).fill("");

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
  it("should return a success message if the event is created", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event")
      .send({
        name: "Event test 1",
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
        eventIdCreated[0] = res.body.eventId;
        chai
          .request(serverAddress)
          .post(baseURL + "/create-event")
          .send({
            name: "Event test 2",
            startDate: startNowDate,
            endDate: endDate,
            location: "Event location",
            description:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            seller_password: "Test123*",
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property("success");
            res.body.success.should.equal("Event created successfully");
            res.body.should.have.property("eventId");
            eventIdCreated[1] = res.body.eventId;
            chai
              .request(serverAddress)
              .post(baseURL + "/create-event")
              .send({
                name: "Event test 3",
                startDate: startDate,
                endDate: endDate,
                location: "Event location",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                seller_password: "Test123*",
              })
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property("success");
                res.body.success.should.equal("Event created successfully");
                res.body.should.have.property("eventId");
                eventIdCreated[2] = res.body.eventId;
                done();
              });
          });
      });
  });
  it("should return an error message if the event already exists", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event")
      .send({
        name: "Event test 1",
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
  it("should return an error if no event is found with the id provided", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/eventId?id=00000000-0000-0000-0000-000000000000")
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "No events found for the id 00000000-0000-0000-0000-000000000000"
        );
        done();
      });
  });
  it("should return an error if the event has no organizer", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/eventId?id=" + eventIdCreated[0])
      .end((err, res) => {
        res.should.have.status(404);
        res.should.have.property("error");
        res.body.error.should.equal("Organizer id not found");
        done();
      });
  });
});

describe("Testing the deleteEvent function...", () => {
  it("should return an error if the provided id is invalid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/delete-event/invalidId")
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Invalid id, invalidId is not a valid uuid"
        );
        done();
      });
  });
  it("should return an error if the id provided does not exist", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/delete-event/00000000-0000-0000-0000-000000000000")
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Event with id 00000000-0000-0000-0000-000000000000 does not exist"
        );
        done();
      });
  });
  it("should return a success message if the event is deleted", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/delete-event/" + eventIdCreated[0])
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Event deleted successfully");
        done();
      });
  });
});

describe("Testing the updateEvent function...", () => {
  it("should return an error if the provided id is invalid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-event/invalidId")
      .send({
        name: "Event test 1",
        startDate: startDate,
        endDate: endDate,
        location: "Event location",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        seller_password: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Invalid id, invalidId is not a valid uuid"
        );
        done();
      });
  });
  it("should return an error if the id provided does not exist", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-event/00000000-0000-0000-0000-000000000000")
      .send({
        name: "Event test 1",
        startDate: startDate,
        endDate: endDate,
        location: "Event location",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        seller_password: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Event with id 00000000-0000-0000-0000-000000000000 does not exist"
        );
        done();
      });
  });
  it("should return an error if the event has already started", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-event/" + eventIdCreated[1])
      .send({
        name: "Event test 1",
        startDate: startDate,
        endDate: endDate,
        location: "Event location",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        seller_password: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Event has already started");
        done();
      });
  });
  it("should return an error message if no values are provided", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-event/" + eventIdCreated[2])
      .send({
        name: null,
        startDate: null,
        endDate: null,
        location: null,
        description: null,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("No values to edit");
        done();
      });
  });
  it("should return a success message if the event hasn't started and is successfully updated", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-event/" + eventIdCreated[2])
      .send({
        name: "Event test 3",
        startDate: startDate,
        endDate: endDate,
        location: "Event location edited",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Event edited successfully");
        done();
      });
  });
  it("should return a success message if the event endDate only is successfully updated", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/update-event/" + eventIdCreated[1])
      .send({
        name: null,
        startDate: null,
        endDate: endDate,
        location: null,
        description: null,
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Event endDate successfully edited");
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
        connection.query("DELETE FROM UsersEvents", (err, result) => {
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
    });
  } else {
    done();
  }
});
