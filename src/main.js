const express = require('express');
const app = express();
const productController = require('./api/controllers/product.controller.js');
const eventController = require('./api/controllers/event.controller.js');
const eventProductController = require('./api/controllers/event_product.controller.js');
const user_eventController = require('./api/controllers/user_event.controller.js');
const userController = require('./api/controllers/user.controller.js');
const commandController = require('./api/controllers/command.controller.js');
const eventProductCommandController = require('./api/controllers/event_product_command.controller.js');
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

const apiVersion = 'v1'
const baseURL = `/api/${apiVersion}`;

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
app.get(baseURL + '/products', (req, res) => {
  productController.getAllProducts(req, res);
});
//Get product by id
app.get(baseURL + '/productId', (req, res) => {
  productController.getProductById(req, res);
});
//Get product by name or by part of name
app.get(baseURL + '/productName', (req, res) => {
  productController.getProductByName(req, res);
});
//Get products of category
app.get(baseURL + '/productCategory', (req, res) => {
  productController.getProductByCategory(req, res);
});
//Create product
app.post(baseURL + '/create-product', (req, res) => {
  productController.createProduct(req, res);
});
//Soft delete product
app.put(baseURL + '/delete-product/:id', (req, res) => {
  productController.deleteProduct(req, res);
});

//#############################################################################
// EVENTS
//#############################################################################

//Get all events
app.get(baseURL + '/events', (req, res) => {
  eventController.getAllEvents(req, res);
});
//Get event by id
app.get(baseURL + '/eventId', (req, res) => {
  eventController.getEventById(req, res);
});
//Get event by name or by part of name
app.get(baseURL + '/eventName', (req, res) => {
  eventController.getEventByName(req, res);
});
//Get events between two dates
app.get(baseURL + '/eventBetweenDates', (req, res) => {
  eventController.getEventBetweenDates(req, res);
});
//Get future events
app.get(baseURL + '/future-events', (req, res) => {
  eventController.getFutureEvents(req, res);
});
//Get current events
app.get(baseURL + '/current-events', (req, res) => {
  eventController.getCurrentEvents(req, res);
});
//Get past events
app.get(baseURL + '/past-events', (req, res) => {
  eventController.getPastEvents(req, res);
});
//Create event
app.post(baseURL + '/create-event', (req, res) => {
  eventController.createEvent(req, res);
});
//Soft delete event
app.put(baseURL + '/delete-event/:id', (req, res) => {
  eventController.deleteEvent(req, res);
});
//Update event
app.put(baseURL + '/update-event/:id', (req, res) => {
  eventController.editEvent(req, res);
});
//Update seller_password
app.put(baseURL + '/update-seller-password/:id', (req, res) => {
  eventController.editSellerPassword(req, res);
});

//#############################################################################
// EVENTS PRODUCTS
//#############################################################################

//Get all events products
app.get(baseURL + '/event-products', (req, res) => {
  eventProductController.getAllEventProducts(req, res);
});
//Get event products by event id
app.get(baseURL + '/event-products-by-event-id', (req, res) => {
  eventProductController.getAllEventProductsByEventId(req, res);
});
//Get stock of product at an event
app.get(baseURL + '/event-product-stock', (req, res) => {
  eventProductController.getProductEventStock(req, res);
});
//Get buying price of product at an event
app.get(baseURL + '/event-product-buying-price', (req, res) => {
  eventProductController.getProductEventBuyingPrice(req, res);
});
//Get selling price of product at an event
app.get(baseURL + '/event-product-selling-price', (req, res) => {
  eventProductController.getProductEventSellingPrice(req, res);
});
//Get infos of product at an event
app.get(baseURL + '/event-products-infos', (req, res) => {
  eventProductController.getProductEventInfos(req, res);
});
//Create event product
app.post(baseURL + '/create-event-product', (req, res) => {
  eventProductController.createEventProduct(req, res);
});
//Soft delete event product
app.put(baseURL + '/delete-event-product/:id', (req, res) => {
  eventProductController.deleteEventProduct(req, res);
});
//Update stock, buying price and selling price of event product
app.put(baseURL + '/update-event-product/:id', (req, res) => {
  eventProductController.editEventProduct(req, res);
});
//Update stock of event product after a sale
app.put(baseURL + '/update-event-product-stock', (req, res) => {
  eventProductController.sellProduct(req, res);
});

//#############################################################################
// USERS_EVENTS
//#############################################################################

//Get all users events
app.get(baseURL + '/users-events', (req, res) => {
  user_eventController.getAllUsersEvents(req, res);
});
//Get all user at specific event
app.get(baseURL + '/users-for-event/:event_id', (req, res) => {
  user_eventController.getAllUsersForEvent(req, res);
});
//Get role for user at event
app.get(baseURL + '/user-role-for-event', (req, res) => {
  user_eventController.getUserRoleForEvent(req, res);
});
//Create user event
app.post(baseURL + '/user-join-event', (req, res) => {
  user_eventController.userJoinEvent(req, res);
});
//Soft delete user event
app.put(baseURL + '/quit-event', (req, res) => {
  user_eventController.quitEvent(req, res);
});
//Update role for user at event : user -> seller
app.put(baseURL + '/user-to-seller', (req, res) => {
  user_eventController.userToSeller(req, res);
});
//Update role for user at event : seller -> user
app.put(baseURL + '/seller-to-user', (req, res) => {
  user_eventController.sellerToUser(req, res);
});

//#############################################################################
// USERS
//#############################################################################

//Get all users
app.get(baseURL + '/users', (req, res) => {
  userController.getAllUsers(req, res);
});
//Get user by id
app.get(baseURL + '/user-with-id', (req, res) => {
  userController.getUserWithId(req, res);
});
//Get user by name or by part of name
app.get(baseURL + '/user-with-name', (req, res) => {
  userController.getUserWithName(req, res);
});
//Get user by email
app.get(baseURL + '/user-with-email', (req, res) => {
  userController.getUserWithEmail(req, res);
});
//Create user
app.post(baseURL + '/create-user', (req, res) => {
  userController.createUser(req, res);
});
//Update user data
app.put(baseURL + '/update-user', (req, res) => {
  userController.updateUser(req, res);
});
//Update user password
app.put(baseURL + '/update-user-password', (req, res) => {
  userController.updateUserPassword(req, res);
});
//Login user
app.get(baseURL + '/login', (req, res) => {
  userController.login(req, res);
});
//Soft delete user
app.put(baseURL + '/delete-user/:id', (req, res) => {
  userController.deleteUser(req, res);
});
//Get user age
app.get(baseURL + '/user-age/:id', (req, res) => {
  userController.isUserAdult(req, res);
});

//#############################################################################
// COMMANDS
//#############################################################################

//Get all commands
app.get(baseURL + '/commands', (req, res) => {
  commandController.getAllCommands(req, res);
});
//Get command by id
app.get(baseURL + '/command-with-id/:id', (req, res) => {
  commandController.getCommandById(req, res);
});
//Get commands by client id
app.get(baseURL + '/commands-with-client-id/:id', (req, res) => {
  commandController.getCommandsByClientId(req, res);
});
//Get commands by event id
app.get(baseURL + '/commands-with-event-id/:id', (req, res) => {
  commandController.getCommandsByEventId(req, res);
});
//Get commands by servedBy id
app.get(baseURL + '/commands-with-served-by-id/:id', (req, res) => {
  commandController.getCommandsByServedById(req, res);
});
//Get all served commands or with clientId or with eventId
app.get(baseURL + '/commands-served', (req, res) => {
  commandController.getServedCommands(req, res);
});
//Get all paid commands or with clientId or with eventId
app.get(baseURL + '/commands-paid', (req, res) => {
  commandController.getPaidCommands(req, res);
});
//Get all unserved commands or with clientId or with eventId
app.get(baseURL + '/commands-not-served', (req, res) => {
  commandController.getUnservedCommands(req, res);
});
//Get all unpaid commands or with clientId or with eventId
app.get(baseURL + '/commands-not-paid', (req, res) => {
  commandController.getUnpaidCommands(req, res);
});
//Create command
app.post(baseURL + '/create-command', (req, res) => {
  commandController.createCommand(req, res);
});
//Set command served state
app.put(baseURL + '/set-command-served-state/:commandId', (req, res) => {
  commandController.setCommandServedState(req, res);
});
//Set command paid state
app.put(baseURL + '/set-command-paid-state/:commandId', (req, res) => {
  commandController.setCommandPaidState(req, res);
});
//Soft delete command
app.put(baseURL + '/delete-command/:commandId', (req, res) => {
  commandController.deleteCommand(req, res);
});

//#############################################################################
// EVENT PRODUCT COMMAND
//#############################################################################

//Get all event product commands
app.get(baseURL + '/event-product-command', (req, res) => {
  eventProductCommandController.getAllEventProductCommands(req, res);
});
//Get event product command by id
app.get(baseURL + '/event-product-command-with-id/:id', (req, res) => {
  eventProductCommandController.getEventProductCommandById(req, res);
});
//Get event product commands with command id
app.get(baseURL + '/event-product-command-with-command-id/:id', (req, res) => {
  eventProductCommandController.getEventProductsCommandsForCommandId(req, res);
});
//Get number of event products for command id and event product id
app.get(baseURL + '/number-for-event-product-command', (req, res) => {
  eventProductCommandController.getNumber(req, res);
});
//Get all infos of a command
app.get(baseURL + '/infos-for-command/:commandId', (req, res) => {
  eventProductCommandController.getAllInfosForCommand(req, res);
});