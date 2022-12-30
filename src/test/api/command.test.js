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

const startNowDate = new Date(
  new Date().setSeconds(new Date().getSeconds() + 14) //IF ERROR DURING THE TEST FOR CREATING AN EVENT WITH START DATE NOW, EDIT THE NUMBER OF SECONDS TO ADD
).toISOString();
const endDate = new Date(
  new Date().setDate(new Date().getDate() + 2)
).toISOString();

let eventIdCreated = "";
let productIdCreated = "";
let eventProductIdCreated = "";
let usersIdCreated = new Array(3).fill("");
let userEventIdCreated = new Array(3).fill("");
let commandsIdCreated = new Array();

chai
  .request(serverAddress)
  .post(baseURL + "/create-user")
  .send({
    emailAddress: "client.doe@testing.lan",
    firstName: "Client",
    lastName: "Doe",
    password: "Test123*",
    passwordConfirmation: "Test123*",
    birthday: "01/01/1970",
  })
  .end((err, res) => {
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.should.have.property("message").eql("User created successfully");
    res.body.should.have.property("userCreated");
    usersIdCreated[0] = res.body.userCreated.id;
    chai
      .request(serverAddress)
      .post(baseURL + "/create-user")
      .send({
        emailAddress: "seller.doe@testing.lan",
        firstName: "Seller",
        lastName: "Doe",
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
        res.body.should.have.property("userCreated");
        usersIdCreated[1] = res.body.userCreated.id;
        chai
          .request(serverAddress)
          .post(baseURL + "/create-user")
          .send({
            emailAddress: "organizer.doe@testing.lan",
            firstName: "Organizer",
            lastName: "Doe",
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
            res.body.should.have.property("userCreated");
            usersIdCreated[2] = res.body.userCreated.id;
            chai
              .request(serverAddress)
              .post(baseURL + "/create-product")
              .send({
                name: "Produit Test Commande",
                category: "2",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
              })
              .end((err, res) => {
                res.should.have.status(201);
                res.body.should.have.property("success");
                res.body.success.should.equal("Product created successfully");
                chai
                  .request(serverAddress)
                  .get(baseURL + "/products")
                  .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    productIdCreated = res.body[0].id;
                    chai
                      .request(serverAddress)
                      .post(baseURL + "/create-event")
                      .send({
                        name: "Event test 1",
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
                        res.body.success.should.equal(
                          "Event created successfully"
                        );
                        res.body.should.have.property("eventId");
                        eventIdCreated = res.body.eventId;
                        chai
                          .request(serverAddress)
                          .post(baseURL + "/create-event-product")
                          .send({
                            event_id: eventIdCreated,
                            product_id: productIdCreated,
                            stock: 100,
                            buyingPrice: 1.5,
                            sellingPrice: 2.0,
                          })
                          .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.have.property("success");
                            res.body.success.should.equal(
                              "Product successfully added to the event"
                            );
                            chai
                              .request(serverAddress)
                              .get(
                                baseURL +
                                  "/event-products-by-event-id?id=" +
                                  eventIdCreated
                              )
                              .end((err, res) => {
                                res.status.should.equal(200);
                                res.body.should.be.a("array");
                                res.body[0].should.have.property(
                                  "events_products_id"
                                );
                                res.body[0].events_products_id.should.be.a(
                                  "string"
                                );
                                eventProductIdCreated =
                                  res.body[0].events_products_id;
                                chai
                                  .request(serverAddress)
                                  .post(baseURL + "/user-join-event")
                                  .send({
                                    userId: usersIdCreated[0],
                                    eventId: eventIdCreated,
                                    role: 0,
                                  })
                                  .end((err, res) => {
                                    res.should.have.status(200);
                                    res.body.should.have.property("success");
                                    res.body.success.should.equal(
                                      "User successfully joined event"
                                    );
                                    chai
                                      .request(serverAddress)
                                      .post(baseURL + "/user-join-event")
                                      .send({
                                        userId: usersIdCreated[1],
                                        eventId: eventIdCreated,
                                        sellerPassword: "Test123*",
                                        role: 1,
                                      })
                                      .end((err, res) => {
                                        res.should.have.status(200);
                                        res.body.should.have.property(
                                          "success"
                                        );
                                        res.body.success.should.equal(
                                          "Seller successfully joined event"
                                        );
                                        chai
                                          .request(serverAddress)
                                          .post(baseURL + "/user-join-event")
                                          .send({
                                            userId: usersIdCreated[2],
                                            eventId: eventIdCreated,
                                            role: 2,
                                          })
                                          .end((err, res) => {
                                            res.should.have.status(200);
                                            res.body.should.have.property(
                                              "success"
                                            );
                                            res.body.success.should.equal(
                                              "Organizer successfully joined event"
                                            );
                                            chai
                                              .request(serverAddress)
                                              .get(
                                                baseURL +
                                                  "/users-for-event/" +
                                                  eventIdCreated
                                              )
                                              .end((err, res) => {
                                                res.should.have.status(200);
                                                res.body.should.be.a("array");
                                                res.body.length.should.be.eql(
                                                  3
                                                );
                                                res.body[0].should.have.property(
                                                  "id"
                                                );
                                                res.body[1].should.have.property(
                                                  "id"
                                                );
                                                userEventIdCreated[0] =
                                                  res.body[0].id;
                                                userEventIdCreated[1] =
                                                  res.body[1].id;
                                                userEventIdCreated[2] =
                                                  res.body[2].id;
                                              });
                                          });
                                      });
                                  });
                              });
                          });
                      });
                  });
              });
          });
      });
  });

describe("POST /create-command", () => {
  it("should return an error message if no event id is provided", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: null,
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("No event id provided");
        done();
      });
  });
  it("should return an error message if no event is found for the provided id", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: "00000000-0000-0000-0000-000000000000",
      })
      .end((err, res) => {
        res.status.should.equal(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("No event found with the id provided");
        done();
      });
  });
  it("should return an error message if no client id and no client name are provided", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: eventIdCreated,
        clientId: null,
        clientName: null,
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("A client id or a client name is required");
        done();
      });
  });
  it("should return an error message if the sellerId provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: eventIdCreated,
        clientId: usersIdCreated[0],
        sellerId: "invalidId",
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("The sellerId provided is not valid");
        done();
      });
  });
  it("should return an error message if no client is found for the provided id", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: eventIdCreated,
        clientId: "00000000-0000-0000-0000-000000000000",
        sellerId: usersIdCreated[1],
      })
      .end((err, res) => {
        res.status.should.equal(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "No user found with the client id provided"
        );
        done();
      });
  });
  it("should return a success message if the command is created with a client and a seller id", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: eventIdCreated,
        clientId: usersIdCreated[0],
        sellerId: usersIdCreated[1],
      })
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Command created successfully");
        res.body.should.have.property("commandId");
        res.body.commandId.should.be.a("string");
        commandsIdCreated[0] = res.body.commandId;
        done();
      });
  });
  it("should return an error message if no client is found for the provided id", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: eventIdCreated,
        clientId: "00000000-0000-0000-0000-000000000000",
      })
      .end((err, res) => {
        res.status.should.equal(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "No user found with the client id provided"
        );
        done();
      });
  });
  it("should return a success message if the command is created with a client id and no seller id", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: eventIdCreated,
        clientId: usersIdCreated[0],
      })
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Command created successfully");
        res.body.should.have.property("commandId");
        res.body.commandId.should.be.a("string");
        commandsIdCreated[1] = res.body.commandId;
        done();
      });
  });
  it("should return an error message if the sellerId provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: eventIdCreated,
        sellerId: "invalidId",
        clientId: null,
        clientName: "Client Name",
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("The sellerId provided is not valid");
        done();
      });
  });
  it("should return an error message if no user is found with the seller id provided", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: eventIdCreated,
        sellerId: "00000000-0000-0000-0000-000000000000",
        clientId: null,
        clientName: "Client Name",
      })
      .end((err, res) => {
        res.status.should.equal(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "No user found with the seller id provided"
        );
        done();
      });
  });
  it("should return a success message if the command is created with a client name and a seller id", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: eventIdCreated,
        sellerId: usersIdCreated[1],
        clientId: null,
        clientName: "Client Name",
      })
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Command created successfully");
        res.body.should.have.property("commandId");
        res.body.commandId.should.be.a("string");
        commandsIdCreated[2] = res.body.commandId;
        done();
      });
  });
  it("should return a success message if the command is created with a client name and no seller id", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-command")
      .send({
        eventId: eventIdCreated,
        clientId: null,
        clientName: "Client Name",
      })
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property("success");
        res.body.success.should.equal("Command created successfully");
        res.body.should.have.property("commandId");
        res.body.commandId.should.be.a("string");
        commandsIdCreated[3] = res.body.commandId;
        done();
      });
  });
});

describe("PUT /set-command-served-by/{commandId}", () => {
  it("should return an error message if the command id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/set-command-served-by/" + "invalidId")
      .send({
        sellerId: "invalidId",
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Invalid id, invalidId is not a valid command uuid"
        );
        done();
      });
  });
  it("should return an error message if the seller id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/set-command-served-by/" + commandsIdCreated[1])
      .send({
        sellerId: "invalidId",
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("The seller id provided is not valid");
        done();
      });
  });
  it("should return a success message if the command is set as served", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/set-command-served-by/" + commandsIdCreated[1])
      .send({
        sellerId: usersIdCreated[1],
      })
      .end((err, res) => {
        res.status.should.equal(200);
        done();
      });
  });
});

describe("GET /event-client-names/{eventId}", () => {
  it("should return an error message if the event id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/event-client-names/" + "invalidId")
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("The event id provided is not valid");
        done();
      });
  });
  it("should return a list of client names for the event", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/event-client-names/" + eventIdCreated)
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.be.a("array");
        res.body.length.should.equal(2);
        res.body[0].should.have.property("client_name");
        res.body[1].should.have.property("client_name");
        done();
      });
  });
});

describe("PUT /set-command-paid-state/{commandId}", () => {
  it("should return an error message if the command id provided is not a valid id", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/set-command-paid-state/" + "invalidId")
      .send({
        paid: 1,
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Invalid id, invalidId is not a valid command uuid"
        );
        done();
      });
  });
  it("should return an error message if the paid value provided is not 0 or 1", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/set-command-paid-state/" + commandsIdCreated[1])
      .send({
        paid: 2,
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Paid value must be 0 or 1");
        done();
      });
  });
  it("should return a success message if the command is set as paid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/set-command-paid-state/" + commandsIdCreated[1])
      .send({
        paid: 1,
      })
      .end((err, res) => {
        res.status.should.equal(200);
        done();
      });
  });
});

describe("PUT /set-command-served-state/{commandId}", () => {
  it("should return an error message if the command id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/set-command-served-state/" + "invalidId")
      .send({
        served: 1,
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Invalid id, invalidId is not a valid command uuid"
        );
        done();
      });
  });
  it("should return an error message if the served value provided is not 0 or 1", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/set-command-served-state/" + commandsIdCreated[1])
      .send({
        served: 2,
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Served value must be 0 or 1");
        done();
      });
  });
  it("should return a success message if the command is set as served", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/set-command-served-state/" + commandsIdCreated[1])
      .send({
        served: 1,
      })
      .end((err, res) => {
        res.status.should.equal(200);
        done();
      });
  });
});
// - Get commands by event id
// - Cancel command
// - Get command infos

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
