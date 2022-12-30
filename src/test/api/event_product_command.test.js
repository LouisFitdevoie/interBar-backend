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
let commandsIdCreated = new Array(2).fill("");
let eventProductCommandIdCreated = "";

chai
  .request(serverAddress)
  .post(baseURL + "/create-user")
  .send({
    emailAddress: "client2.doe@testing.lan",
    firstName: "Client2",
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
        emailAddress: "seller2.doe@testing.lan",
        firstName: "Seller2",
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
            emailAddress: "organizer2.doe@testing.lan",
            firstName: "Organizer2",
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
                name: "Produit Test EventProductCommand",
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
                        name: "Event test EventProductCommand",
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
                                                chai
                                                  .request(serverAddress)
                                                  .post(
                                                    baseURL + "/create-command"
                                                  )
                                                  .send({
                                                    eventId: eventIdCreated,
                                                    sellerId: usersIdCreated[1],
                                                    clientId: null,
                                                    clientName: "Client Name",
                                                  })
                                                  .end((err, res) => {
                                                    res.status.should.equal(
                                                      200
                                                    );
                                                    res.body.should.have.property(
                                                      "success"
                                                    );
                                                    res.body.success.should.equal(
                                                      "Command created successfully"
                                                    );
                                                    res.body.should.have.property(
                                                      "commandId"
                                                    );
                                                    res.body.commandId.should.be.a(
                                                      "string"
                                                    );
                                                    commandsIdCreated[0] =
                                                      res.body.commandId;
                                                    chai
                                                      .request(serverAddress)
                                                      .post(
                                                        baseURL +
                                                          "/create-command"
                                                      )
                                                      .send({
                                                        eventId: eventIdCreated,
                                                        sellerId: null,
                                                        clientId: null,
                                                        clientName:
                                                          "Client Name",
                                                      })
                                                      .end((err, res) => {
                                                        res.status.should.equal(
                                                          200
                                                        );
                                                        res.body.should.have.property(
                                                          "success"
                                                        );
                                                        res.body.success.should.equal(
                                                          "Command created successfully"
                                                        );
                                                        res.body.should.have.property(
                                                          "commandId"
                                                        );
                                                        res.body.commandId.should.be.a(
                                                          "string"
                                                        );
                                                        commandsIdCreated[1] =
                                                          res.body.commandId;
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
      });
  });

describe("POST /create-event-product-command", () => {
  it("should return an error message if the event product id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event-product-command")
      .send({
        eventProductId: "invalidId",
        commandId: "invalidId",
        number: "a",
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Invalid id, invalidId is not a valid event product uuid"
        );
        done();
      });
  });
  it("should return an error message if the command id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event-product-command")
      .send({
        eventProductId: eventIdCreated,
        commandId: "invalidId",
        number: "a",
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Invalid command id invalidId");
        done();
      });
  });
  it("should return an error message if the number provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event-product-command")
      .send({
        eventProductId: eventProductIdCreated,
        commandId: commandsIdCreated[0],
        number: "a",
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Invalid number, a is not a valid number");
        done();
      });
  });
  it("should return a success message if the event product command has been created", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event-product-command")
      .send({
        eventProductId: eventProductIdCreated,
        commandId: commandsIdCreated[0],
        number: 1,
      })
      .end((err, res) => {
        res.status.should.equal(200);
        done();
      });
  });
  it("should return an error message if the event product command already exists", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event-product-command")
      .send({
        eventProductId: eventProductIdCreated,
        commandId: commandsIdCreated[0],
        number: 1,
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Event product command already exists");
        done();
      });
  });
});

describe("GET /infos-for-command/{commandId}", () => {
  it("should return an error message if the command id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/infos-for-command/" + "invalidId")
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Invalid id, invalidId is not a valid command uuid"
        );
        done();
      });
  });
  it("should return an error message if the command id provided does not exist", (done) => {
    chai
      .request(serverAddress)
      .get(
        baseURL + "/infos-for-command/" + "00000000-0000-0000-0000-000000000000"
      )
      .end((err, res) => {
        res.status.should.equal(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "No commands found for the command id 00000000-0000-0000-0000-000000000000"
        );
        done();
      });
  });
  it("should return an error message if no event product commands are found for the command id provided", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/infos-for-command/" + commandsIdCreated[1])
      .end((err, res) => {
        res.status.should.equal(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "No event products commands found for the command id " +
            commandsIdCreated[1]
        );
        done();
      });
  });
  it("should return the command infos including seller's infos if the command id provided is valid and a seller id is found", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/infos-for-command/" + commandsIdCreated[0])
      .end((err, res) => {
        res.status.should.equal(200);
        res.status.should.equal(200);
        res.body.should.be.a("object");
        res.body.should.have.property("command");
        res.body.command.should.be.a("object");
        res.body.command.should.have.property("event_id");
        res.body.command.should.have.property("isServed");
        res.body.command.should.have.property("isPaid");
        res.body.command.should.have.property("created_at");
        res.body.should.have.property("products");
        res.body.products.should.be.a("array");
        res.body.products[0].should.be.a("object");
        res.body.products[0].should.have.property("eventProductCommandId");
        eventProductCommandIdCreated =
          res.body.products[0].eventProductCommandId;
        res.body.products[0].should.have.property("productId");
        res.body.products[0].should.have.property("name");
        res.body.products[0].should.have.property("category");
        res.body.products[0].should.have.property("description");
        res.body.products[0].should.have.property("sellingPrice");
        res.body.products[0].should.have.property("number");
        res.body.should.have.property("client");
        res.body.client.should.be.a("object");
        res.body.client.should.have.property("id");
        res.body.client.should.have.property("firstName");
        res.body.client.should.have.property("lastName");
        res.body.client.should.have.property("birthday");
        res.body.client.should.have.property("emailAddress");
        done();
      });
  });
});

describe("PUT /edit-event-product-command-number/{eventProductCommandId}", () => {
  it("should return an error message if the event product command id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/edit-event-product-command-number/" + "invalidId")
      .send({
        number: 10,
        commandId: commandsIdCreated[0],
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Invalid id, invalidId is not a valid event product command uuid"
        );
        done();
      });
  });
  it("should return an error message if the number provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .put(
        baseURL +
          "/edit-event-product-command-number/" +
          eventProductCommandIdCreated
      )
      .send({
        number: "a",
        commandId: commandsIdCreated[0],
      })
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Invalid number, a is not a valid number");
        done();
      });
  });
  it("should return a success message if the event product command number is updated", (done) => {
    chai
      .request(serverAddress)
      .put(
        baseURL +
          "/edit-event-product-command-number/" +
          eventProductCommandIdCreated
      )
      .send({
        number: 10,
        commandId: commandsIdCreated[0],
      })
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property("success");
        res.body.success.should.equal(
          "Event product command number updated successfully"
        );
        done();
      });
  });
});

describe("Testing PUT /delete-event-product-command/{eventProductCommandId}", () => {
  it("should return an error if the event product command if provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/delete-event-product-command/" + "invalidId")
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Invalid id, invalidId is not a valid event product command uuid"
        );
        done();
      });
  });
  it("should return a success message if the event product command is deleted", (done) => {
    chai
      .request(serverAddress)
      .put(
        baseURL +
          "/delete-event-product-command/" +
          eventProductCommandIdCreated
      )
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.property("success");
        res.body.success.should.equal(
          "Event product command deleted successfully"
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
