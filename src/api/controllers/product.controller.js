const uuid = require("uuid");
const database = require("../../database.js");
const pool = database.pool;

class Product {
  constructor(name, category, description) {
    this.name = name;
    this.category = category;
    this.description = description;
  }
  id = uuid.v4();
  name;
  category;
  description;
  deleted_at = null;
}

exports.getAllProducts = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    //Return all products that are not deleted and order them by name
    connection.query(
      "SELECT * FROM Products WHERE deleted_at IS null ORDER BY name",
      (err, result) => {
        connection.release();
        if (err) throw err;
        res.send(result);
      }
    );
  });
};

exports.getProductById = (req, res) => {
  if (uuid.validate(req.query.id)) {
    //Verify that the id is a valid uuid
    pool.getConnection((err, connection) => {
      if (err) throw err;
      if (process.env.NODE_ENV !== "testing")
        console.log(`Getting product with id ${req.query.id}`);
      connection.query(
        "SELECT * FROM Products WHERE id = ? AND deleted_at IS null",
        [req.query.id],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            if (process.env.NODE_ENV !== "testing")
              console.log("Number of products found: " + result.length + "");
            res.send(result);
          } else {
            if (process.env.NODE_ENV !== "testing")
              console.log("No products found");
            res
              .status(404)
              .send({ error: "No products found for the id " + req.query.id });
          }
        }
      );
    });
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log(`Invalid id ${req.query.id}`);
    res
      .status(400)
      .send({ error: "Invalid id, " + req.query.id + " is not a valid uuid" });
  }
};

exports.getProductByName = (req, res) => {
  pool.getConnection((err, connection) => {
    if (process.env.NODE_ENV !== "testing")
      console.log("Getting products with name " + req.query.name.trim());
    connection.query(
      "SELECT * FROM Products WHERE name LIKE ? AND deleted_at IS null ORDER BY name",
      "%" + req.query.name.trim() + "%",
      function (err, result) {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          if (process.env.NODE_ENV !== "testing")
            console.log("Number of products found: " + result.length + "");
          res.send(result);
        } else {
          if (process.env.NODE_ENV !== "testing")
            console.log("No products found");
          res.status(404).send({
            error: "No products found for the name " + req.query.name.trim(),
          });
        }
      }
    );
  });
};

exports.getProductByCategory = (req, res) => {
  if (req.query.category.trim().length > 0) {
    //Verify that the category is not empty
    if (
      parseInt(req.query.category.trim()) === 0 ||
      parseInt(req.query.category.trim()) === 1 ||
      parseInt(req.query.category.trim()) === 2
    ) {
      //Verify if category is 0, 1 or 2 -> if not, return 404
      pool.getConnection((err, connection) => {
        if (err) throw err;
        //Return all products for the category and that are not deleted
        if (process.env.NODE_ENV !== "testing")
          console.log(
            "Getting products with category " + req.query.category.trim()
          );
        connection.query(
          "SELECT * FROM Products WHERE category = ? AND deleted_at IS null ORDER BY name",
          [req.query.category.trim()],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              if (process.env.NODE_ENV !== "testing")
                console.log("Number of products found: " + result.length + "");
              res.send(result);
            } else {
              if (process.env.NODE_ENV !== "testing")
                console.log("No products found");
              res.status(404).send({
                error:
                  "No products found for the category " +
                  req.query.category.trim(),
              });
            }
          }
        );
      });
    } else {
      res.status(404).send({ error: "Category must be 0, 1 or 2" });
    }
  } else {
    res.status(404).send({ error: "No category was specified in the request" });
  }
};

exports.createProduct = (req, res) => {
  if (req.body.name.trim().length > 0 && req.body.category.trim().length > 0) {
    //Verify that the name and category are not empty
    if (
      req.body.category.trim() === "0" ||
      req.body.category.trim() === "1" ||
      req.body.category.trim() === "2"
    ) {
      //Verify if category is 0, 1 or 2 -> if not, return 404
      let description;
      if (req.body.description.trim().length > 0) {
        //Verify that the description is not empty
        description = req.body.description.trim();
      } else {
        description = null;
      }
      let newProduct = new Product(
        req.body.name.trim(),
        req.body.category,
        description
      );
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "SELECT * FROM Products WHERE name = ? AND deleted_at IS null",
          [newProduct.name],
          (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
              connection.release();
              if (process.env.NODE_ENV !== "testing")
                console.log("Product already exists");
              res.status(400).send({ error: "Product already exists" });
            } else {
              if (process.env.NODE_ENV !== "testing")
                console.log("Creating product with name " + newProduct.name);
              connection.query(
                "INSERT INTO Products (id, name, category, description, deleted_at) VALUES (?, ?, ?, ?, ?)",
                [
                  newProduct.id,
                  newProduct.name,
                  newProduct.category,
                  newProduct.description,
                  newProduct.deleted_at,
                ],
                (err, result) => {
                  connection.release();
                  if (err) throw err;
                  if (process.env.NODE_ENV !== "testing")
                    console.log("Product created");
                  res
                    .status(201)
                    .send({ success: "Product created successfully" });
                }
              );
            }
          }
        );
      });
    } else {
      res.status(400).send({ error: "Category must be 0, 1 or 2" });
    }
  } else {
    res.status(400).send({
      error: "Name and category must be specified in the request",
    });
  }
};

exports.deleteProduct = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT * FROM Products WHERE id = ? AND deleted_at IS null",
        [req.params.id],
        (err, result) => {
          if (err) throw err;
          if (result.length != 1) {
            connection.release();
            if (process.env.NODE_ENV !== "testing")
              console.log(
                "Product with id " + req.params.id + " does not exist"
              );
            res.status(404).send({
              error: "Product with id " + req.params.id + " does not exist",
            });
          } else {
            if (process.env.NODE_ENV !== "testing")
              console.log("Deleting product with id " + req.params.id);
            connection.query(
              "UPDATE Products SET deleted_at = NOW() WHERE id = ?",
              [req.params.id],
              (err, result) => {
                connection.release();
                if (err) throw err;
                if (process.env.NODE_ENV !== "testing")
                  console.log("Product deleted");
                res.status(200).send({
                  success: "Product deleted successfully",
                  result: result,
                });
              }
            );
          }
        }
      );
    });
  } else {
    res
      .status(404)
      .send({ error: "Invalid id, " + req.query.id + " is not a valid uuid" });
  }
};
