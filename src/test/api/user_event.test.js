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

let usersCreatedId = new Array(4).fill("");
let eventIdCreated = "";

describe("POST /user-join-event", () => {
  it("should return an error message if the event id provided is invalid", (done) => {
    chai
      .request(serverAddress)
      .post(`${baseURL}/user-join-event`)
      .send({
        userId: "invalidId",
        eventId: "invalidId",
        role: 0,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("invalidId is not a valid event id");
        done();
      });
  });
  it("should return an error message if the user id provided is invalid", (done) => {
    chai
      .request(serverAddress)
      .post(`${baseURL}/user-join-event`)
      .send({
        userId: "invalidId",
        eventId: "00000000-0000-0000-0000-000000000000",
        role: 0,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("invalidId is not a valid user id");
        done();
      });
  });
  it("should return an error message if no event exists with the id provided", (done) => {
    chai
      .request(serverAddress)
      .post(`${baseURL}/user-join-event`)
      .send({
        userId: "00000000-0000-0000-0000-000000000000",
        eventId: "00000000-0000-0000-0000-000000000000",
        role: 0,
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("Event not found");
        done();
      });
  });
  it("should return an error message if no user exists with the id provided", (done) => {
    //Before, we need to create an event
    const startDate = new Date(
      new Date().setDate(new Date().getDate() + 1)
    ).toISOString();
    const endDate = new Date(
      new Date().setDate(new Date().getDate() + 2)
    ).toISOString();
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
        eventIdCreated = res.body.eventId;
        //Now we can test the function
        chai
          .request(serverAddress)
          .post(`${baseURL}/user-join-event`)
          .send({
            userId: "00000000-0000-0000-0000-000000000000",
            eventId: eventIdCreated,
            role: 0,
          })
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.have.property("error");
            res.body.error.should.equal("User not found");
            done();
          });
      });
  });
  it("should return an error message if the role provided is different from 0, 1 or 2", (done) => {
    //Before, we need to create four users for the following tests
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
        usersCreatedId[0] = res.body.userCreated.id;
        chai
          .request(serverAddress)
          .post(baseURL + "/create-user")
          .send({
            emailAddress: "jane.doe@testing.lan",
            firstName: "Jane",
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
            usersCreatedId[1] = res.body.userCreated.id;
            chai
              .request(serverAddress)
              .post(baseURL + "/create-user")
              .send({
                emailAddress: "johnny.doey@testing.lan",
                firstName: "Johnny",
                lastName: "Doey",
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
                usersCreatedId[2] = res.body.userCreated.id;
                chai
                  .request(serverAddress)
                  .post(baseURL + "/create-user")
                  .send({
                    emailAddress: "janey.doey@testing.lan",
                    firstName: "Janey",
                    lastName: "Doey",
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
                    usersCreatedId[3] = res.body.userCreated.id;
                    //Now we can test the function
                    chai
                      .request(serverAddress)
                      .post(`${baseURL}/user-join-event`)
                      .send({
                        userId: usersCreatedId[0],
                        eventId: eventIdCreated,
                        role: 3,
                      })
                      .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.have.property("error");
                        res.body.error.should.equal(
                          "Invalid role, must be 0, 1 or 2"
                        );
                        done();
                      });
                  });
              });
          });
      });
  });
  it("should return a success message if a user joined the event successfully", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/user-join-event")
      .send({
        userId: usersCreatedId[0],
        eventId: eventIdCreated,
        role: 0,
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("User successfully joined event");
        done();
      });
  });
  it("should return an error message if the user already joined the event", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/user-join-event")
      .send({
        userId: usersCreatedId[0],
        eventId: eventIdCreated,
        role: 0,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("User already joined this event");
        done();
      });
  });
  it("should return an error message if the seller password is not provided", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/user-join-event")
      .send({
        userId: usersCreatedId[1],
        eventId: eventIdCreated,
        sellerPassword: "",
        role: 1,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Seller password required");
        done();
      });
  });
  it("should return an error message if the seller password is incorrect", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/user-join-event")
      .send({
        userId: usersCreatedId[1],
        eventId: eventIdCreated,
        sellerPassword: "InvalidPassword",
        role: 1,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Seller password incorrect");
        done();
      });
  });
  it("should return a success message if the seller joined the event successfully", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/user-join-event")
      .send({
        userId: usersCreatedId[1],
        eventId: eventIdCreated,
        sellerPassword: "Test123*",
        role: 1,
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Seller successfully joined event");
        done();
      });
  });
  it("should return a success message if the organizer joined the event successfully", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/user-join-event")
      .send({
        userId: usersCreatedId[2],
        eventId: eventIdCreated,
        role: 2,
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Organizer successfully joined event");
        done();
      });
  });
  it("should return an error message if an organizer already joined the event", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/user-join-event")
      .send({
        userId: usersCreatedId[3],
        eventId: eventIdCreated,
        role: 2,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Organizer already joined this event");
        done();
      });
  });
});

describe("GET /users-events/{userId}", () => {
  it("should return an error message if the userID is not valid", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/users-events/" + "invalidUserId")
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("invalidUserId is not a valid user id");
        done();
      });
  });
  it("should return an error message if the user does not exist", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/users-events/" + "00000000-0000-0000-0000-000000000000")
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("User not found");
        done();
      });
  });
  it("should return the events the user is participating in", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/users-events/" + usersCreatedId[0])
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.be.eql(1);
        res.body[0].should.have.property("id");
        res.body[0].should.have.property("name");
        res.body[0].should.have.property("description");
        res.body[0].should.have.property("startdate");
        res.body[0].should.have.property("enddate");
        res.body[0].should.have.property("created_at");
        res.body[0].should.have.property("location");
        res.body[0].should.have.property("role");
        res.body[0].should.have.property("organizer");
        done();
      });
  });
});

describe("PUT /user-to-seller", () => {
  it("should return an error message if the event id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/user-to-seller")
      .send({
        eventId: "invalidId",
        userId: "invalidId",
        sellerPassword: "",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("invalidId is not a valid event id");
        done();
      });
  });
  it("should return an error message if the user id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/user-to-seller")
      .send({
        eventId: "00000000-0000-0000-0000-000000000000",
        userId: "invalidId",
        sellerPassword: "",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("invalidId is not a valid user id");
        done();
      });
  });
  it("should return an error message if the user does not exist", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/user-to-seller")
      .send({
        eventId: "00000000-0000-0000-0000-000000000000",
        userId: "00000000-0000-0000-0000-000000000000",
        sellerPassword: "",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("User not found");
        done();
      });
  });
  it("should return an error message if the event does not exist", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/user-to-seller")
      .send({
        eventId: "00000000-0000-0000-0000-000000000000",
        userId: usersCreatedId[0],
        sellerPassword: "",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("Event not found");
        done();
      });
  });
  it("should return an error message if the seller password is not provided", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/user-to-seller")
      .send({
        eventId: eventIdCreated,
        userId: usersCreatedId[0],
        sellerPassword: "",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Seller password required");
        done();
      });
  });
  it("should return an error message if the seller password is incorrect", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/user-to-seller")
      .send({
        eventId: eventIdCreated,
        userId: usersCreatedId[0],
        sellerPassword: "IncorrectPassword",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Seller password incorrect");
        done();
      });
  });
  it("should return an error message if the user did not join the event", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/user-to-seller")
      .send({
        eventId: eventIdCreated,
        userId: usersCreatedId[3],
        sellerPassword: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("User not joined this event");
        done();
      });
  });
  it("should return an error message if the user has not the user role", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/user-to-seller")
      .send({
        eventId: eventIdCreated,
        userId: usersCreatedId[1],
        sellerPassword: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("User has not the role user");
        done();
      });
  });
  it("should return a success message if the user is now a seller", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/user-to-seller")
      .send({
        eventId: eventIdCreated,
        userId: usersCreatedId[0],
        sellerPassword: "Test123*",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Successfully changed user to seller");
        done();
      });
  });
});

describe("PUT /seller-to-user", () => {
  it("should return an error message if the event id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/seller-to-user")
      .send({
        eventId: "invalidId",
        userId: "invalidId",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("invalidId is not a valid event id");
        done();
      });
  });
  it("should return an error message if the user id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/seller-to-user")
      .send({
        eventId: "00000000-0000-0000-0000-000000000000",
        userId: "invalidId",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("invalidId is not a valid user id");
        done();
      });
  });
  it("should return an error message if the user does not exist", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/seller-to-user")
      .send({
        eventId: "00000000-0000-0000-0000-000000000000",
        userId: "00000000-0000-0000-0000-000000000000",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("User not found");
        done();
      });
  });
  it("should return an error message if the event does not exist", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/seller-to-user")
      .send({
        eventId: "00000000-0000-0000-0000-000000000000",
        userId: usersCreatedId[0],
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("Event not found");
        done();
      });
  });
  it("should return an error message if the user did not join the event", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/seller-to-user")
      .send({
        eventId: eventIdCreated,
        userId: usersCreatedId[3],
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("User not joined this event");
        done();
      });
  });
  it("should return an error message if the user has not the seller role", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/seller-to-user")
      .send({
        eventId: eventIdCreated,
        userId: usersCreatedId[2],
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("User has not the role seller");
        done();
      });
  });
  it("should return a success message if the user is now a user", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/seller-to-user")
      .send({
        eventId: eventIdCreated,
        userId: usersCreatedId[0],
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("success");
        res.body.success.should.equal(
          "Successfully changed role from seller to user"
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
