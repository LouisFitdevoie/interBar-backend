const uuid = require('uuid');
const database = require('../../database.js');
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
    //Return all products that are not deleted
    connection.query('SELECT * FROM products WHERE deleted_at IS null', (err, result) => {
      connection.release();
      if (err) throw err;
      res.send(result);
    });
  });
}

exports.getProductById = (req, res) => {
  if (uuid.validate(req.query.id)) { //Verify that the id is a valid uuid
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting product with id ${req.query.id}`);
      connection.query('SELECT * FROM products WHERE id = ? AND deleted_at IS null', [req.query.id], (err, result) => {
        connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of products found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No products found');
            res.status(404).send({ 'error': 'No products found for the id ' + req.query.id });
          }
      });
    });
  } else {
    console.log(`Invalid id ${req.query.id}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.query.id + ' is not a valid uuid' });
  }
}

exports.getProductByName = (req, res) => {
  //
  //NEED TO VERIFY THE NAME
  pool.getConnection((err, connection) => {
    console.log('Getting products with name ' + req.query.name);
    connection.query('SELECT * FROM products WHERE name LIKE ? AND deleted_at IS null', '%' + req.query.name + '%', function (err, result) {
      connection.release();
      if (err) throw err;
      if (result.length > 0) {
        console.log('Number of products found: ' + result.length + '');
        res.send(result);
      } else {
        console.log('No products found');
        res.status(404).send({ 'error': 'No products found for the name ' + req.query.name });
      }
    });
  });
}

exports.getProductByCategory = (req, res) => {
  if (req.query.category.length > 0) { //Verify that the category is not empty
    if (parseInt(req.query.category) === 0 || parseInt(req.query.category) === 1 || parseInt(req.query.category) === 2) { //Verify if category is 0, 1 or 2 -> if not, return 404
      pool.getConnection((err, connection) => {
        if (err) throw err;
        //Return all products for the category and that are not deleted
        console.log('Getting products with category ' + req.query.category);
        connection.query('SELECT * FROM products WHERE category = ? AND deleted_at IS null', [req.query.category], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of products found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No products found');
            res.status(404).send({ 'error': 'No products found for the category ' + req.query.category });
          }
        });
      });
    } else {
      res.status(404).send({ 'error': 'Category must be 0, 1 or 2' });
    }
  } else {
    res.status(404).send({ 'error': 'No category was specified in the request' });
  }
}

exports.createProduct = (req, res) => {
  if (req.body.name.length > 0 && req.body.category.length > 0) { //Verify that the name and category are not empty
    if (req.body.category === '0' || req.body.category === '1' || req.body.category === '2') { //Verify if category is 0, 1 or 2 -> if not, return 404
      let description;
      if (req.body.description.length > 0) { //Verify that the description is not empty
        description = req.body.description;
      } else {
        description = null;
      }
      let newProduct = new Product(req.body.name, req.body.category, description);
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT * FROM products WHERE name = ? AND deleted_at IS null', [newProduct.name], (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            connection.release();
            console.log('Product already exists');
            res.status(400).send({ 'error': 'Product already exists' });
          } else {
            console.log('Creating product with name ' + newProduct.name);
            connection.query('INSERT INTO products (id, name, category, description, deleted_at) VALUES (?, ?, ?, ?, ?)', [newProduct.id, newProduct.name, newProduct.category, newProduct.description, newProduct.deleted_at], (err, result) => {
              connection.release();
              if (err) throw err;
              console.log('Product created');
              res.status(201).send({ "success": "Product created successfully" });
            });
          }
        });
      });
    } else {
      res.status(404).send({ 'error': 'Category must be 0, 1 or 2' });
    }
  } else {
    res.status(404).send({ 'error': 'Name, category and description must be specified in the request' });
  }
}

exports.deleteProduct = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT * FROM products WHERE id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
        if (err) throw err;
        if (result.length != 1) {
          connection.release();
          console.log('Product with id ' + req.params.id + ' does not exist');
          res.status(404).send({ 'error': 'Product with id ' + req.params.id + ' does not exist' });
        } else {
          console.log('Deleting product with id ' + req.params.id);
          connection.query('UPDATE products SET deleted_at = NOW() WHERE id = ?', [req.params.id], (err, result) => {
            connection.release();
            if (err) throw err;
            console.log('Product deleted');
            res.status(200).send({ 'message': 'Product deleted', 'result': result });
          });
        }
      });
    });
  } else {
    res.status(404).send({ 'error': 'Invalid id, ' + req.query.id + ' is not a valid uuid' });
  }
}