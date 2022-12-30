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
let productIdCreated = "";
let eventProductIdCreated = "";

describe("POST /create-event-product", () => {
  it("should return an error message if the event id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event-product")
      .send({
        event_id: "invalidId",
        product_id: "invalidId",
        stock: 0,
        buyingPrice: 0.0,
        sellingPrice: 0.0,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "The id specified for the event is not a valid id"
        );
        done();
      });
  });
  it("should return an error message if the product id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event-product")
      .send({
        event_id: "00000000-0000-0000-0000-000000000000",
        product_id: "invalidId",
        stock: 0,
        buyingPrice: 0.0,
        sellingPrice: 0.0,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "The id specified for the product is not a valid id"
        );
        done();
      });
  });
  it("should return an error message if the stock provided is negative", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event-product")
      .send({
        event_id: "00000000-0000-0000-0000-000000000000",
        product_id: "00000000-0000-0000-0000-000000000000",
        stock: -100,
        buyingPrice: 0.0,
        sellingPrice: 0.0,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("The stock must be a positive number");
        done();
      });
  });
  it("should return an error message if the buying price provided is negative", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event-product")
      .send({
        event_id: "00000000-0000-0000-0000-000000000000",
        product_id: "00000000-0000-0000-0000-000000000000",
        stock: 100,
        buyingPrice: -1.5,
        sellingPrice: 0.0,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "The buying price must be a positive number"
        );
        done();
      });
  });
  it("should return an error message if the selling price provided is negative", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event-product")
      .send({
        event_id: "00000000-0000-0000-0000-000000000000",
        product_id: "00000000-0000-0000-0000-000000000000",
        stock: 100,
        buyingPrice: 1.5,
        sellingPrice: -2.0,
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "The selling price must be a positive number"
        );
        done();
      });
  });
  it("should return an error message if the event id provided does not exist", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-event-product")
      .send({
        event_id: "00000000-0000-0000-0000-000000000000",
        product_id: "00000000-0000-0000-0000-000000000000",
        stock: 100,
        buyingPrice: 1.5,
        sellingPrice: 2.0,
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "No event was found with the id 00000000-0000-0000-0000-000000000000"
        );
        done();
      });
  });
  it("should return an error message if the product id provided does not exist", (done) => {
    //First, we need to create an event
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
        chai
          .request(serverAddress)
          .post(baseURL + "/create-event-product")
          .send({
            event_id: eventIdCreated,
            product_id: "00000000-0000-0000-0000-000000000000",
            stock: 100,
            buyingPrice: 1.5,
            sellingPrice: 2.0,
          })
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.have.property("error");
            res.body.error.should.equal(
              "No product was found with the id 00000000-0000-0000-0000-000000000000"
            );
            done();
          });
      });
  });
  it("should return a success message if the event product is created", (done) => {
    //First, we need to create a product
    chai
      .request(serverAddress)
      .post(baseURL + "/create-product")
      .send({
        name: "Product test 1",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        category: "0",
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
                done();
              });
          });
      });
  });
  it("should return an error message if the product already is associated with the event", (done) => {
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
        res.should.have.status(409);
        res.body.should.have.property("error");
        res.body.error.should.equal("The product is already in the event");
        done();
      });
  });
});

describe("Testing GET /event-products-by-event-id?id={eventId}", () => {
  it("should return an error message if the event id provided is not valid", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/event-products-by-event-id?id=" + "invalidId")
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("invalidId is not a valid id");
        done();
      });
  });
  it("should return an error message if the event id provided does not exist", (done) => {
    chai
      .request(serverAddress)
      .get(
        baseURL +
          "/event-products-by-event-id?id=" +
          "00000000-0000-0000-0000-000000000000"
      )
      .end((err, res) => {
        res.status.should.equal(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "No event was found with the id 00000000-0000-0000-0000-000000000000"
        );
        done();
      });
  });
  it("should return an array of products associated with the event", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/event-products-by-event-id?id=" + eventIdCreated)
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.be.a("array");
        res.body[0].should.have.property("events_products_id");
        res.body[0].events_products_id.should.be.a("string");
        eventProductIdCreated = res.body[0].events_products_id;
        res.body[0].should.have.property("product_id");
        res.body[0].product_id.should.be.a("string");
        res.body[0].should.have.property("event_id");
        res.body[0].event_id.should.be.a("string");
        res.body[0].should.have.property("name");
        res.body[0].name.should.be.a("string");
        res.body[0].should.have.property("category");
        res.body[0].category.should.be.a("number");
        res.body[0].should.have.property("description");
        res.body[0].description.should.be.a("string");
        res.body[0].should.have.property("stock");
        res.body[0].stock.should.be.a("number");
        res.body[0].should.have.property("buyingPrice");
        res.body[0].buyingPrice.should.be.a("number");
        res.body[0].should.have.property("sellingPrice");
        res.body[0].sellingPrice.should.be.a("number");
        done();
      });
  });
});

describe("Testing PUT /delete-event-product/{eventProductId}", () => {
  it("should return an error message if the id provided is not a valid id", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/delete-event-product/invalidId")
      .end((err, res) => {
        res.status.should.equal(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("The id specified is not a valid id");
        done();
      });
  });
  it("should return an error message if the id provided does not exist", (done) => {
    chai
      .request(serverAddress)
      .put(
        baseURL + "/delete-event-product/00000000-0000-0000-0000-000000000000"
      )
      .end((err, res) => {
        res.status.should.equal(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "No event product was found with the id 00000000-0000-0000-0000-000000000000"
        );
        done();
      });
  });
  it("should return a success message if the product was successfully deleted from the event", (done) => {
    chai
      .request(serverAddress)
      .put(baseURL + "/delete-event-product/" + eventProductIdCreated)
      .end((err, res) => {
        res.status.should.equal(200);
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
