const express = require('express');
const app = express();
const productController = require('./api/controllers/products.controller.js');
const mysql = require('mysql');
const uuid = require('uuid');

const databasePort = 3306;
const db_connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'test123*',
  database: 'interbar',
  port: databasePort
});

db_connection.connect(function(err) {
  if (err) throw err;
  console.log(`Connected to the database on port ${databasePort}!`);
});

const port = 8000;

app.use(express.json());
app.get('/', (req, res) => {
    let result = {
        message: 'Hello World',
    };
    res.send(JSON.stringify(result));
});

app.get('/products', (req, res) => {
    if (req.query.id) {
      if (req.query.id.length > 0) { //Verify that the id is not empty
        if (uuid.validate(req.query.id)) { //Verify that the id is a valid uuid
          console.log(`Getting product with id ${req.query.id}`);
          db_connection.query('SELECT * FROM products WHERE id = ? AND deleted_at IS null', [req.query.id], (err, result) => {
              if (err) throw err;
              if (result.length > 0) {
                console.log('\n\n\nNumber of products found: ' + result.length + '\n\n\n');
                res.send(result);
              } else {
                console.log('\n\n\nNo products found\n\n\n');
                res.status(404).send({ 'error': 'No products found for the id ' + req.query.id });
              }
          });
        } else {
          console.log(`Invalid id ${req.query.id}`);
          res.status(400).send({ 'error': 'Invalid id, ' + req.query.id + ' is not a valid uuid' });
        }
      } else {
        res.status(400).send({ 'error': 'Invalid id' });
      }
    } else if (req.query.name) {
      //
      //NEED TO VERIFY THE NAME
        db_connection.query('SELECT * FROM products WHERE name LIKE ? AND deleted_at IS null', '%' + req.query.name + '%', function (err, result) {
          if (err) throw err;
          if (result.length > 0) {
            console.log('\n\n\nNumber of products found: ' + result.length + '\n\n\n');
            res.send(result);
          } else {
            console.log('\n\n\nNo products found\n\n\n');
            res.status(404).send({ 'error': 'No products found for the name ' + req.query.name });
          }
        });
    } else if (req.query.category) {
      if (req.query.category.length > 0) { //Verify that the category is not empty
        if (req.query.category === '0' || req.query.category === '1' || req.query.category === '2') { //Verify if category is 0, 1 or 2 -> if not, return 404
          //Return all products for the category and that are not deleted
          db_connection.query('SELECT * FROM products WHERE category = ? AND deleted_at IS null', [req.query.category], (err, result) => {
              if (err) throw err;
              if (result.length > 0) {
                console.log('\n\n\nNumber of products found: ' + result.length + '\n\n\n');
                res.send(result);
              } else {
                console.log('\n\n\nNo products found\n\n\n');
                res.status(404).send({ 'error': 'No products found for the category ' + req.query.category });
              }
          });
        } else {
          res.status(404).send({ 'error': 'Category must be 0, 1 or 2' });
        }
      } else {
        res.status(404).send({ 'error': 'No category was specified in the request' });
      }
    } else {
        //Return all products that are not deleted
        db_connection.query('SELECT * FROM products WHERE deleted_at IS null', function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    }
});


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});