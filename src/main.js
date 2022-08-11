const express = require('express');
const app = express();
const productController = require('./api/controllers/product.controller.js');
const eventController = require('./api/controllers/event.controller.js');
const eventProductController = require('./api/controllers/event_product.controller.js');
const user_eventController = require('./api/controllers/user_event.controller.js');
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

//Get all products
app.get('/products', (req, res) => {
  productController.getAllProducts(req, res);
});
//Get product by id
app.get('/productId', (req, res) => {
  productController.getProductById(req, res);
});
//Get product by name or by part of name
app.get('/productName', (req, res) => {
  productController.getProductByName(req, res);
});
//Get products of category
app.get('/productCategory', (req, res) => {
  productController.getProductByCategory(req, res);
});
//Create product
app.post('/create-product', (req, res) => {
  productController.createProduct(req, res);
});
//Soft delete product
app.put('/delete-product/:id', (req, res) => {
  productController.deleteProduct(req, res);
});

//#############################################################################
// EVENTS
//#############################################################################

//Get all events
app.get('/events', (req, res) => {
  eventController.getAllEvents(req, res);
});
//Get event by id
app.get('/eventId', (req, res) => {
  eventController.getEventById(req, res);
});
//Get event by name or by part of name
app.get('/eventName', (req, res) => {
  eventController.getEventByName(req, res);
});
//Get events between two dates
app.get('/eventBetweenDates', (req, res) => {
  eventController.getEventBetweenDates(req, res);
});
//Get future events
app.get('/future-events', (req, res) => {
  eventController.getFutureEvents(req, res);
});
//Get current events
app.get('/current-events', (req, res) => {
  eventController.getCurrentEvents(req, res);
});
//Get past events
app.get('/past-events', (req, res) => {
  eventController.getPastEvents(req, res);
});
//Create event
app.post('/create-event', (req, res) => {
  eventController.createEvent(req, res);
});
//Soft delete event
app.put('/delete-event/:id', (req, res) => {
  eventController.deleteEvent(req, res);
});

//#############################################################################
// EVENTS PRODUCTS
//#############################################################################

//Get all events products
app.get('/event-products', (req, res) => {
  eventProductController.getAllEventProducts(req, res);
});
//Get event products by event id
app.get('/event-products-by-event-id', (req, res) => {
  eventProductController.getAllEventProductsByEventId(req, res);
});
//Get stock of product at an event
app.get('/event-product-stock', (req, res) => {
  eventProductController.getProductEventStock(req, res);
});
//Get buying price of product at an event
app.get('/event-product-buying-price', (req, res) => {
  eventProductController.getProductEventBuyingPrice(req, res);
});
//Get selling price of product at an event
app.get('/event-product-selling-price', (req, res) => {
  eventProductController.getProductEventSellingPrice(req, res);
});
//Get infods of product at an event
app.get('/event-products-infos', (req, res) => {
  eventProductController.getProductEventInfos(req, res);
});
//Create event product
app.post('/create-event-product', (req, res) => {
  eventProductController.createEventProduct(req, res);
});
//Soft delete event product
app.put('/delete-event-product/:id', (req, res) => {
  eventProductController.deleteEventProduct(req, res);
});
//Update stock, buying price and selling price of event product
app.put('/update-event-product/:id', (req, res) => {
  eventProductController.editEventProduct(req, res);
});
//Update stock of event product after a sale
app.put('/update-event-product-stock', (req, res) => {
  eventProductController.sellProduct(req, res);
});

//#############################################################################
// USERS_EVENTS
//#############################################################################

app.get('/users-events', (req, res) => {
  user_eventController.getAllUsersEvents(req, res);
});
app.get('/users-for-event/:event_id', (req, res) => {
  user_eventController.getAllUsersForEvent(req, res);
});
app.get('/user-role-for-event', (req, res) => {
  user_eventController.getUserRoleForEvent(req, res);
});
app.post('/user-join-event', (req, res) => {
  user_eventController.userJoinEvent(req, res);
});
app.put('/quit-event', (req, res) => {
  user_eventController.quitEvent(req, res);
});