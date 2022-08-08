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

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.use(express.json());
app.get('/', (req, res) => {
  let result = {
      message: 'Hello World',
  };
  res.send(JSON.stringify(result));
});

app.get('/products', (req, res) => {
  if (req.query.id) {
    productController.getProductById(req, res);
  } else if (req.query.name) {
    productController.getProductByName(req, res);
  } else if (req.query.category) {
    productController.getProductByCategory(req, res);
  } else {
      productController.getAllProducts(req, res);
  }
});