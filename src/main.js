const express = require("express");
const app = express();
const mysql = require("mysql");
const uuid = require("uuid");
require("dotenv").config();

const productController = require("./api/controllers/product.controller.js");
const eventController = require("./api/controllers/event.controller.js");
const eventProductController = require("./api/controllers/event_product.controller.js");
const user_eventController = require("./api/controllers/user_event.controller.js");
const userController = require("./api/controllers/user.controller.js");
const commandController = require("./api/controllers/command.controller.js");
const eventProductCommandController = require("./api/controllers/event_product_command.controller.js");
const authenticationController = require("./api/controllers/authentication.controller.js");
const authTokenMiddleware = require("./api/middlewares/authorization_token.middleware.js");

const databasePort = process.env.DATABASE_PORT || 3306;
const db_connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "interbar",
  port: databasePort,
});

const apiVersion = "v2.2";
const baseURL = `/api/${apiVersion}`;

db_connection.connect(function (err) {
  if (err) throw err;
  console.log(`Connected to the database on port ${databasePort}!`);
});

const port = process.env.API_PORT || 8000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.use(express.json());

//#############################################################################
// PRODUCTS
//#############################################################################

//Get all products
app.get(
  baseURL + "/products",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    productController.getAllProducts(req, res);
  }
);
//Get product by id
app.get(
  baseURL + "/productId",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    productController.getProductById(req, res);
  }
);
//Get product by name or by part of name
app.get(
  baseURL + "/productName",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    productController.getProductByName(req, res);
  }
);
//Get products of category
app.get(
  baseURL + "/productCategory",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    productController.getProductByCategory(req, res);
  }
);
//Create product
app.post(
  baseURL + "/create-product",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    productController.createProduct(req, res);
  }
);
//Soft delete product
app.put(
  baseURL + "/delete-product/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    productController.deleteProduct(req, res);
  }
);

//#############################################################################
// EVENTS
//#############################################################################

//Get all events
app.get(
  baseURL + "/events",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventController.getAllEvents(req, res);
  }
);
//Get event by id
app.get(
  baseURL + "/eventId",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventController.getEventById(req, res);
  }
);
//Get event by name or by part of name
app.get(
  baseURL + "/eventName",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventController.getEventByName(req, res);
  }
);
//Get events between two dates
app.get(
  baseURL + "/eventBetweenDates",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventController.getEventBetweenDates(req, res);
  }
);
//Get future events
app.get(
  baseURL + "/future-events",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventController.getFutureEvents(req, res);
  }
);
//Get current events
app.get(
  baseURL + "/current-events",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventController.getCurrentEvents(req, res);
  }
);
//Get past events
app.get(
  baseURL + "/past-events",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventController.getPastEvents(req, res);
  }
);
//Create event
app.post(
  baseURL + "/create-event",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventController.createEvent(req, res);
  }
);
//Soft delete event
app.put(
  baseURL + "/delete-event/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventController.deleteEvent(req, res);
  }
);
//Update event
app.put(
  baseURL + "/update-event/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventController.editEvent(req, res);
  }
);
//Update seller_password
app.put(
  baseURL + "/update-seller-password/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventController.editSellerPassword(req, res);
  }
);

//#############################################################################
// EVENTS PRODUCTS
//#############################################################################

//Get all events products
app.get(
  baseURL + "/event-products",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductController.getAllEventProducts(req, res);
  }
);
//Get event products by event id
app.get(
  baseURL + "/event-products-by-event-id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductController.getAllEventProductsByEventId(req, res);
  }
);
//Get stock of product at an event
app.get(
  baseURL + "/event-product-stock",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductController.getProductEventStock(req, res);
  }
);
//Get buying price of product at an event
app.get(
  baseURL + "/event-product-buying-price",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductController.getProductEventBuyingPrice(req, res);
  }
);
//Get selling price of product at an event
app.get(
  baseURL + "/event-product-selling-price",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductController.getProductEventSellingPrice(req, res);
  }
);
//Get infos of product at an event
app.get(
  baseURL + "/event-products-infos",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductController.getProductEventInfos(req, res);
  }
);
//Create event product
app.post(
  baseURL + "/create-event-product",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductController.createEventProduct(req, res);
  }
);
//Soft delete event product
app.put(
  baseURL + "/delete-event-product/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductController.deleteEventProduct(req, res);
  }
);
//Update stock, buying price and selling price of event product
app.put(
  baseURL + "/update-event-product/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductController.editEventProduct(req, res);
  }
);
//Update stock of event product after a sale
app.put(
  baseURL + "/update-event-product-stock",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductController.sellProduct(req, res);
  }
);

//#############################################################################
// USERS_EVENTS
//#############################################################################

//Get all users events
app.get(
  baseURL + "/users-events",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    user_eventController.getAllUsersEvents(req, res);
  }
);
//Get all user at specific event
app.get(
  baseURL + "/users-for-event/:event_id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    user_eventController.getAllUsersForEvent(req, res);
  }
);
//Get role for user at event
app.get(
  baseURL + "/user-role-for-event",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    user_eventController.getUserRoleForEvent(req, res);
  }
);
//Create user event
app.post(
  baseURL + "/user-join-event",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    user_eventController.userJoinEvent(req, res);
  }
);
//Soft delete user event
app.put(
  baseURL + "/quit-event",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    user_eventController.quitEvent(req, res);
  }
);
//Update role for user at event : user -> seller
app.put(
  baseURL + "/user-to-seller",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    user_eventController.userToSeller(req, res);
  }
);
//Update role for user at event : seller -> user
app.put(
  baseURL + "/seller-to-user",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    user_eventController.sellerToUser(req, res);
  }
);
//Get all events that joined an user
app.get(
  baseURL + "/users-events/:userId",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    user_eventController.getAllEventsForUser(req, res);
  }
);

//#############################################################################
// USERS
//#############################################################################

//Get all users
app.get(
  baseURL + "/users",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    userController.getAllUsers(req, res);
  }
);
//Get user by id
app.get(
  baseURL + "/user-with-id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    userController.getUserWithId(req, res);
  }
);
//Get user by name or by part of name
app.get(
  baseURL + "/user-with-name",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    userController.getUserWithName(req, res);
  }
);
//Get user by email
app.get(
  baseURL + "/user-with-email",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    userController.getUserWithEmail(req, res);
  }
);
//Create user
app.post(baseURL + "/create-user", (req, res) => {
  authenticationController.createUser(req, res);
});
//Update user data
app.put(
  baseURL + "/update-user",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    userController.updateUser(req, res);
  }
);
//Update user password
app.put(
  baseURL + "/update-user-password",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    userController.updateUserPassword(req, res);
  }
);
//Login user
app.post(baseURL + "/login", (req, res) => {
  authenticationController.login(req, res);
});
//Update token
app.post(baseURL + "/update-token", (req, res) => {
  authenticationController.updateToken(req, res);
});
//Logout user
app.delete(baseURL + "/logout", (req, res) => {
  authenticationController.logout(req, res);
});
//Soft delete user
app.put(
  baseURL + "/delete-user/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    userController.deleteUser(req, res);
  }
);
//Get user age
app.get(
  baseURL + "/user-age/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    userController.isUserAdult(req, res);
  }
);

//#############################################################################
// COMMANDS
//#############################################################################

//Get all commands
app.get(
  baseURL + "/commands",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getAllCommands(req, res);
  }
);
//Get command by id
app.get(
  baseURL + "/command-with-id/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getCommandById(req, res);
  }
);
//Get commands by client id
app.get(
  baseURL + "/commands-with-client-id/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getCommandsByClientId(req, res);
  }
);
//Get commands by client name
app.get(
  baseURL + "/commands-with-client-name/:name",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getCommandsByClientName(req, res);
  }
);
//Get commands by event id
app.get(
  baseURL + "/commands-with-event-id/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getCommandsByEventId(req, res);
  }
);
//Get commands by servedBy id
app.get(
  baseURL + "/commands-with-served-by-id/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getCommandsByServedById(req, res);
  }
);
//Get all served commands or with clientId or with eventId
app.get(
  baseURL + "/commands-served",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getServedCommands(req, res);
  }
);
//Get all paid commands or with clientId or with eventId
app.get(
  baseURL + "/commands-paid",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getPaidCommands(req, res);
  }
);
//Get all unserved commands or with clientId or with eventId
app.get(
  baseURL + "/commands-not-served",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getUnservedCommands(req, res);
  }
);
//Get all unpaid commands or with clientId or with eventId
app.get(
  baseURL + "/commands-not-paid",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getUnpaidCommands(req, res);
  }
);
//Create command
app.post(
  baseURL + "/create-command",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.createCommand(req, res);
  }
);
//Set command served state
app.put(
  baseURL + "/set-command-served-state/:commandId",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.setCommandServedState(req, res);
  }
);
//Set command paid state
app.put(
  baseURL + "/set-command-paid-state/:commandId",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.setCommandPaidState(req, res);
  }
);
//Soft delete command
app.put(
  baseURL + "/delete-command/:commandId",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.deleteCommand(req, res);
  }
);

app.get(
  baseURL + "/event-client-names/:eventId",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getClientNamesFromEvent(req, res);
  }
);

app.put(
  baseURL + "/set-command-served-by/:commandId",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    console.log("ici");
    commandController.setSellerId(req, res);
  }
);

app.get(
  baseURL + "/command-infos/:commandId",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    commandController.getCommandInfos(req, res);
  }
);

//#############################################################################
// EVENT PRODUCT COMMAND
//#############################################################################

//Get all event product commands
app.get(
  baseURL + "/event-product-command",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductCommandController.getAllEventProductCommands(req, res);
  }
);
//Get event product command by id
app.get(
  baseURL + "/event-product-command-with-id/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductCommandController.getEventProductCommandById(req, res);
  }
);
//Get event product commands with command id
app.get(
  baseURL + "/event-product-command-with-command-id/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductCommandController.getEventProductsCommandsForCommandId(
      req,
      res
    );
  }
);
//Get number of event products for command id and event product id
app.get(
  baseURL + "/number-for-event-product-command",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductCommandController.getNumber(req, res);
  }
);
//Get all infos of a command
app.get(
  baseURL + "/infos-for-command/:commandId",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductCommandController.getAllInfosForCommand(req, res);
  }
);
//Create event product command
app.post(
  baseURL + "/create-event-product-command",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductCommandController.createEventProductCommand(req, res);
  }
);
//Delete event product command
app.put(
  baseURL + "/delete-event-product-command/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductCommandController.deleteEventProductCommand(req, res);
  }
);
//Edit event product command number
app.put(
  baseURL + "/edit-event-product-command-number/:id",
  authTokenMiddleware.verifyAuthorizationToken,
  (req, res) => {
    eventProductCommandController.editNumber(req, res);
  }
);
