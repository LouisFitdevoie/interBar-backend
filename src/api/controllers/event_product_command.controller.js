const uuid = require("uuid");
const database = require("../../database.js");
const pool = database.pool;

class EventProductCommand {
  constructor(command_id, event_product_id, number) {
    this.command_id = command_id;
    this.event_product_id = event_product_id;
    this.number = number;
  }
  id = uuid.v4();
  command_id;
  event_product_id;
  number;
  deleted_at = null;
}

exports.getAllEventProductCommands = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    //Return all products that are not deleted
    connection.query(
      "SELECT * FROM EventsProductsCommands WHERE deleted_at IS null",
      (err, result) => {
        connection.release();
        if (err) throw err;
        res.send(result);
      }
    );
  });
};

exports.getEventProductCommandById = (req, res) => {
  if (uuid.validate(req.params.id)) {
    //Verify that the id is a valid uuid
    pool.getConnection((err, connection) => {
      if (err) throw err;
      if (process.env.NODE_ENV !== "testing")
        console.log(`Getting event product command with id ${req.params.id}`);
      connection.query(
        "SELECT * FROM EventsProductsCommands WHERE id = ? AND deleted_at IS null",
        [req.params.id],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            if (process.env.NODE_ENV !== "testing")
              console.log(
                "Number of event product commands found: " + result.length + ""
              );
            res.send(result);
          } else {
            if (process.env.NODE_ENV !== "testing")
              console.log("No event product commands found");
            res.status(404).send({
              error:
                "No event product commands found for the id " + req.params.id,
            });
          }
        }
      );
    });
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log(`Invalid id ${req.params.id}`);
    res
      .status(400)
      .send({ error: "Invalid id, " + req.params.id + " is not a valid uuid" });
  }
};

exports.getEventProductsCommandsForCommandId = (req, res) => {
  if (uuid.validate(req.params.id)) {
    //Verify that the id is a valid uuid
    pool.getConnection((err, connection) => {
      if (err) throw err;
      if (process.env.NODE_ENV !== "testing")
        console.log(
          `Getting event products commands for command id ${req.params.id}`
        );
      connection.query(
        "SELECT * FROM EventsProductsCommands WHERE command_id = ? AND deleted_at IS null",
        [req.params.id],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            if (process.env.NODE_ENV !== "testing")
              console.log(
                "Number of event products commands found: " + result.length + ""
              );
            res.send(result);
          } else {
            if (process.env.NODE_ENV !== "testing")
              console.log("No event products commands found");
            res.status(404).send({
              error:
                "No event products commands found for the command id " +
                req.params.id,
            });
          }
        }
      );
    });
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log(`Invalid id ${req.params.id}`);
    res
      .status(400)
      .send({ error: "Invalid id, " + req.params.id + " is not a valid uuid" });
  }
};

exports.getNumber = (req, res) => {
  if (uuid.validate(req.query.commandId)) {
    if (uuid.validate(req.query.eventProductId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        if (process.env.NODE_ENV !== "testing")
          console.log(
            `Getting number for command id ${req.query.commandId} and event product id ${req.query.eventProductId}`
          );
        connection.query(
          "SELECT number FROM EventsProductsCommands WHERE command_id = ? AND event_product_id = ? AND deleted_at IS null",
          [req.query.commandId, req.query.eventProductId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              if (process.env.NODE_ENV !== "testing")
                console.log(
                  "Number of event products commands found: " +
                    result.length +
                    ""
                );
              res.send(result);
            } else {
              if (process.env.NODE_ENV !== "testing")
                console.log("No event products commands found");
              res.status(404).send({
                error:
                  "No event products commands found for the command id " +
                  req.query.commandId +
                  " and event product id " +
                  req.query.eventProductId,
              });
            }
          }
        );
      });
    } else {
      if (process.env.NODE_ENV !== "testing")
        console.log(`Invalid id ${req.query.eventProductId}`);
      res.status(400).send({
        error:
          "Invalid id, " + req.query.eventProductId + " is not a valid uuid",
      });
    }
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log(`Invalid command id ${req.query.commandId}`);
    res
      .status(400)
      .send({ error: `Invalid command id ${req.query.commandId}` });
  }
};

exports.getAllInfosForCommand = (req, res) => {
  if (uuid.validate(req.params.commandId)) {
    let objectToReturn = {
      command: {
        event_id: "",
        isServed: "",
        isPaid: "",
        created_at: "",
      },
      products: [],
      seller: {
        id: "",
        firstName: "",
        lastName: "",
        birthday: "",
        emailAddress: "",
      },
      client: {
        id: "",
        firstName: "",
        lastName: "",
        birthday: "",
        emailAddress: "",
      },
    };
    pool.getConnection((err, connection) => {
      if (err) throw err;
      if (process.env.NODE_ENV !== "testing")
        console.log(`Getting all infos for command id ${req.params.commandId}`);
      connection.query(
        "SELECT id, client_id, client_name, servedby_id, event_id, isserved, ispaid, created_at FROM Commands WHERE id = ?",
        [req.params.commandId],
        (err, result) => {
          if (err) throw err;
          if (result.length === 1) {
            let commandId = result[0].id;
            let clientId = result[0].client_id;
            let clientName = result[0].client_name;
            let sellerId = result[0].servedby_id;
            objectToReturn.command.event_id = result[0].event_id;
            objectToReturn.command.isServed = result[0].isserved;
            objectToReturn.command.isPaid = result[0].ispaid;
            objectToReturn.command.created_at = result[0].created_at;
            connection.query(
              "SELECT EventsProductsCommands.id AS events_products_commands_id, EventsProductsCommands.event_product_id, EventsProductsCommands.number, EventsProducts.product_id, EventsProducts.sellingprice, Products.name, Products.category, Products.description FROM EventsProductsCommands INNER JOIN EventsProducts ON EventsProductsCommands.event_product_id = EventsProducts.id INNER JOIN Products ON EventsProducts.product_id = Products.id WHERE EventsProductsCommands.command_id = ? AND EventsProductsCommands.deleted_at IS null",
              [commandId],
              (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                  let products_table = [];
                  result.forEach((product) => {
                    products_table.push({
                      eventProductCommandId:
                        product.events_products_commands_id,
                      productId: product.event_product_id,
                      name: product.name,
                      category: product.category,
                      description: product.description,
                      sellingPrice: product.sellingprice,
                      number: product.number,
                    });
                  });

                  objectToReturn.products = products_table;

                  if (sellerId != null) {
                    connection.query(
                      "SELECT id, firstname, lastname, birthday, emailaddress FROM Users WHERE id = ?",
                      [sellerId],
                      (err, result) => {
                        if (err) throw err;
                        if (result.length > 0) {
                          objectToReturn.seller.id = result[0].id;
                          objectToReturn.seller.firstName = result[0].firstname;
                          objectToReturn.seller.lastName = result[0].lastname;
                          objectToReturn.seller.birthday = result[0].birthday;
                          objectToReturn.seller.emailAddress =
                            result[0].emailaddress;

                          if (clientId != null) {
                            connection.query(
                              "SELECT id, firstname, lastname, birthday, emailaddress FROM Users WHERE id = ?",
                              [clientId],
                              (err, result) => {
                                connection.release();
                                if (err) throw err;
                                if (result.length > 0) {
                                  objectToReturn.client.id = result[0].id;
                                  objectToReturn.client.firstName =
                                    result[0].firstname;
                                  objectToReturn.client.lastName =
                                    result[0].lastname;
                                  objectToReturn.client.birthday =
                                    result[0].birthday;
                                  objectToReturn.client.emailAddress =
                                    result[0].emailaddress;
                                  res.send(objectToReturn);
                                } else {
                                  if (process.env.NODE_ENV !== "testing")
                                    console.log("No client found");
                                  res.status(404).send({
                                    error:
                                      "No client found for the client id " +
                                      objectToReturn.command.client_id,
                                  });
                                }
                              }
                            );
                          } else {
                            objectToReturn.client.id = null;
                            objectToReturn.client.firstName =
                              clientName.split(" ")[0];
                            objectToReturn.client.lastName =
                              clientName.split(" ")[1];
                            objectToReturn.client.birthday = null;
                            objectToReturn.client.emailAddress = null;
                            res.send(objectToReturn);
                          }
                        }
                      }
                    );
                  } else {
                    objectToReturn.seller.id = "";
                    objectToReturn.seller.firstName = "";
                    objectToReturn.seller.lastName = "";
                    objectToReturn.seller.birthday = "";
                    objectToReturn.seller.emailAddress = "";

                    objectToReturn.client.id = "";
                    objectToReturn.client.firstName = clientName.split(" ")[0];
                    objectToReturn.client.lastName = clientName.split(" ")[1];
                    objectToReturn.client.birthday = "";
                    objectToReturn.client.emailAddress = "";
                    res.send(objectToReturn);
                  }
                } else {
                  connection.release();
                  if (process.env.NODE_ENV !== "testing")
                    console.log("No event products commands found");
                  res.status(404).send({
                    error:
                      "No event products commands found for the command id " +
                      req.body.commandId,
                  });
                }
              }
            );
          } else {
            connection.release();
            if (process.env.NODE_ENV !== "testing")
              console.log("No commands found");
            res.status(404).send({
              error:
                "No commands found for the command id " + req.body.commandId,
            });
          }
        }
      );
    });
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log(`Invalid id ${req.body.commandId}`);
    res.status(400).send({
      error:
        "Invalid id, " + req.body.commandId + " is not a valid command uuid",
    });
  }
};

exports.createEventProductCommand = (req, res) => {
  if (uuid.validate(req.body.eventProductId)) {
    if (uuid.validate(req.body.commandId)) {
      if (req.body.number && parseInt(req.body.number)) {
        pool.getConnection((err, connection) => {
          if (err) throw err;
          connection.query(
            "SELECT id FROM EventsProductsCommands WHERE event_product_id = ? AND command_id = ? AND deleted_at IS null",
            [req.body.eventProductId, req.body.commandId],
            (err, result) => {
              if (err) throw err;
              if (result.length === 0) {
                let epc_to_add = new EventProductCommand(
                  req.body.commandId,
                  req.body.eventProductId,
                  req.body.number
                );
                connection.query(
                  "INSERT INTO `EventsProductsCommands` (`id`, `command_id`, `event_product_id`, `number`) VALUES (?, ?, ?, ?)",
                  [
                    epc_to_add.id,
                    epc_to_add.command_id,
                    epc_to_add.event_product_id,
                    epc_to_add.number,
                  ],
                  (err, result) => {
                    connection.release();
                    if (err) throw err;
                    if (process.env.NODE_ENV !== "testing")
                      console.log("Event product command created");
                    res.send(result);
                  }
                );
              } else {
                connection.release();
                if (process.env.NODE_ENV !== "testing")
                  console.log("Event product command already exists");
                res
                  .status(400)
                  .send({ error: "Event product command already exists" });
              }
            }
          );
        });
      } else {
        if (process.env.NODE_ENV !== "testing")
          console.log(`Invalid number ${req.body.number}`);
        res.status(400).send({
          error:
            "Invalid number, " + req.body.number + " is not a valid number",
        });
      }
    } else {
      if (process.env.NODE_ENV !== "testing")
        console.log(`Invalid command id ${req.body.commandId}`);
      res
        .status(400)
        .send({ error: `Invalid command id ${req.body.commandId}` });
    }
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log(`Invalid id ${req.body.eventProductId}`);
    res.status(400).send({
      error:
        "Invalid id, " +
        req.body.eventProductId +
        " is not a valid event product uuid",
    });
  }
};

exports.deleteEventProductCommand = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "UPDATE EventsProductsCommands SET deleted_at = NOW() WHERE id = ?",
        [req.params.id],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (process.env.NODE_ENV !== "testing")
            console.log("Event product command deleted");
          res
            .status(200)
            .send({ success: "Event product command deleted successfully" });
        }
      );
    });
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log(`Invalid id ${req.params.id}`);
    res.status(400).send({
      error:
        "Invalid id, " +
        req.params.id +
        " is not a valid event product command uuid",
    });
  }
};

exports.editNumber = (req, res) => {
  if (uuid.validate(req.params.id)) {
    if (req.body.number && parseInt(req.body.number)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "UPDATE Commands SET ispaid = 0, isserved = 0 WHERE id = ?",
          [req.body.commandId],
          (err, result) => {
            if (err) throw err;
            connection.query(
              "UPDATE EventsProductsCommands SET number = ? WHERE id = ?",
              [req.body.number, req.params.id],
              (err, result) => {
                connection.release();
                if (err) throw err;
                if (process.env.NODE_ENV !== "testing")
                  console.log("Event product command number updated");
                res.status(200).send({
                  success: "Event product command number updated successfully",
                });
              }
            );
          }
        );
      });
    } else {
      if (process.env.NODE_ENV !== "testing")
        console.log(`Invalid number ${req.body.number}`);
      res.status(400).send({
        error: "Invalid number, " + req.body.number + " is not a valid number",
      });
    }
  } else {
    if (process.env.NODE_ENV !== "testing")
      console.log(`Invalid id ${req.params.id}`);
    res.status(400).send({
      error:
        "Invalid id, " +
        req.params.id +
        " is not a valid event product command uuid",
    });
  }
};
