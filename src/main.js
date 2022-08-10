const express = require('express');
const app = express();
const productController = require('./api/controllers/products.controller.js');
const eventController = require('./api/controllers/event.controller.js');
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

//#############################################################################
// PRODUCTS
//#############################################################################

app.get('/products', (req, res) => {
  productController.getAllProducts(req, res);
});
app.get('/productId', (req, res) => {
  productController.getProductById(req, res);
});
app.get('/productName', (req, res) => {
  productController.getProductByName(req, res);
});
app.get('/productCategory', (req, res) => {
  productController.getProductByCategory(req, res);
});
app.post('/products', (req, res) => {
  productController.createProduct(req, res);
});
app.put('/delete-product/:id', (req, res) => {
  productController.deleteProduct(req, res);
});

//#############################################################################
// EVENTS
//#############################################################################

app.get('/events', (req, res) => {
  eventController.getAllEvents(req, res);
});
app.get('/eventId', (req, res) => {
  eventController.getEventById(req, res);
});
app.get('/eventName', (req, res) => {
  eventController.getEventByName(req, res);
});
app.get('/eventBetweenDates', (req, res) => {
  eventController.getEventBetweenDates(req, res);
});
app.get('/future-events', (req, res) => {
  eventController.getFutureEvents(req, res);
});
app.get('/current-events', (req, res) => {
  eventController.getCurrentEvents(req, res);
});
app.get('/past-events', (req, res) => {
  eventController.getPastEvents(req, res);
});
app.post('/events', (req, res) => {
  eventController.createEvent(req, res);
});
app.put('/delete-event/:id', (req, res) => {
  eventController.deleteEvent(req, res);
});