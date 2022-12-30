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

describe("POST /create-product", () => {
  it("should return an error message if name, category and description are not provided", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-product")
      .send({
        name: "",
        category: "",
        description: "",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal(
          "Name, category and description must be specified in the request"
        );
        done();
      });
  });
  it("should return an error message if category is different than 0, 1 or 2", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-product")
      .send({
        name: "Produit test",
        category: "3",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("error");
        res.body.error.should.equal("Category must be 0, 1 or 2");
        done();
      });
  });
  it("should return a success message if the product is created", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-product")
      .send({
        name: "Produit test",
        category: "0",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.have.property("success");
        res.body.success.should.equal("Product created successfully");
        done();
      });
  });
  it("it should return an error message if the product already exists", (done) => {
    chai
      .request(serverAddress)
      .post(baseURL + "/create-product")
      .send({
        name: "Produit test",
        category: "0",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property("error");
        res.body.error.should.equal("Product already exists");
        done();
      });
  });
});

describe("GET /products", () => {
  it("should return an array of products", (done) => {
    chai
      .request(serverAddress)
      .get(baseURL + "/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
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
