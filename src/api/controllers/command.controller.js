const uuid = require("uuid");
const database = require("../../database.js");
const pool = database.pool;

class Command {
  constructor(client_id, servedBy_id, event_id, isServed, isPaid) {
    this.client_id = client_id;
    this.servedBy_id = servedBy_id;
    this.event_id = event_id;
    this.isServed = isServed;
    this.isPaid = isPaid;
  }
  id = uuid.v4();
  client_id;
  servedBy_id;
  event_id;
  isServed;
  isPaid;
  created_at = new Date();
  deleted_at = null;
}

exports.getAllCommands = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query(
      "SELECT * FROM commands WHERE deleted_at IS null",
      (err, result) => {
        connection.release();
        if (err) throw err;
        res.send(result);
      }
    );
  });
};

exports.getCommandById = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting command with id ${req.params.id}`);
      connection.query(
        "SELECT * FROM commands WHERE id = ? AND deleted_at IS null",
        [req.params.id],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log("Number of commands found: " + result.length + "");
            res.send(result);
          } else {
            console.log("No commands found");
            res
              .status(404)
              .send({ error: "No commands found for the id " + req.params.id });
          }
        }
      );
    });
  } else {
    console.log(`Invalid id ${req.params.id}`);
    res
      .status(400)
      .send({ error: "Invalid id, " + req.params.id + " is not a valid uuid" });
  }
};

exports.getCommandsByClientId = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting commands with client id ${req.params.id}`);
      connection.query(
        "SELECT * FROM commands WHERE client_id = ? AND deleted_at IS null",
        [req.params.id],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log("Number of commands found: " + result.length + "");
            res.send(result);
          } else {
            console.log("No commands found");
            res.status(404).send({
              error: "No commands found for the client id " + req.params.id,
            });
          }
        }
      );
    });
  } else {
    console.log(`Invalid id ${req.params.id}`);
    res
      .status(400)
      .send({ error: "Invalid id, " + req.params.id + " is not a valid uuid" });
  }
};

exports.getCommandsByClientName = (req, res) => {
  if (req.params.clientName != null) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting commands with client name ${req.params.clientName}`);
      connection.query(
        "SELECT * FROM commands WHERE client_name = ? AND deleted_at IS null",
        [req.params.clientName],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log("Number of commands found: " + result.length + "");
            res.send(result);
          } else {
            console.log("No commands found");
            res.status(404).send({
              error:
                "No commands found for the client name " +
                req.params.clientName,
            });
          }
        }
      );
    });
  } else {
    console.log("Client name unspecified");
    res.status(400).send({ error: "Client name must be specified" });
  }
};

exports.getCommandsByEventId = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting commands with event id ${req.params.id}`);
      connection.query(
        "SELECT commands.id, commands.client_id, commands.client_name, commands.servedBy_id, commands.event_id, commands.isServed, commands.isPaid, commands.created_at, commands.deleted_at, events_products_commands.id AS events_products_commands_id, events_products_commands.command_id, events_products_commands.event_product_id, events_products_commands.number, events_products_commands.deleted_at AS events_products_commands_deleted_at, events_products.sellingprice FROM commands LEFT JOIN events_products_commands ON commands.id = events_products_commands.command_id INNER JOIN events_products ON events_products_commands.event_product_id = events_products.id WHERE commands.event_id = ? AND commands.deleted_at IS null",
        [req.params.id],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            let commandsToReturn = [];
            result.forEach((command) => {
              let commandIndex = commandsToReturn.findIndex(
                (commandToReturn) => commandToReturn.id === command.id
              );
              if (commandIndex === -1) {
                let newCommand = {
                  id: command.id,
                  client_id: command.client_id,
                  client_name: command.client_name,
                  servedBy_id: command.servedBy_id,
                  event_id: command.event_id,
                  isServed: new Boolean(command.isServed),
                  isPaid: new Boolean(command.isPaid),
                  created_at: command.created_at,
                  deleted_at: command.deleted_at,
                  events_products_commands: [
                    {
                      id: command.events_products_commands_id,
                      event_product_id: command.event_product_id,
                      number: command.number,
                      deleted_at: command.events_products_commands_deleted_at,
                      sellingPrice: command.sellingprice,
                    },
                  ],
                };
                commandsToReturn.push(newCommand);
              } else {
                commandsToReturn[commandIndex].events_products_commands.push({
                  id: command.events_products_commands_id,
                  command_id: command.command_id,
                  event_product_id: command.event_product_id,
                  number: command.number,
                  deleted_at: command.events_products_commands_deleted_at,
                  sellingPrice: command.sellingprice,
                });
              }
            });
            let commandsWithTotalPrice = commandsToReturn.map((command) => {
              let totalPrice = 0;
              command.events_products_commands.forEach(
                (eventProductCommand) => {
                  totalPrice +=
                    eventProductCommand.number *
                    eventProductCommand.sellingPrice;
                }
              );
              command.totalPrice = totalPrice;
              return command;
            });
            console.log(
              "Number of commands found: " + commandsWithTotalPrice.length + ""
            );
            res.send(commandsWithTotalPrice);
          } else {
            console.log("No commands found");
            res.status(404).send({
              error: "No commands found for the event id " + req.params.id,
            });
          }
        }
      );
    });
  } else {
    console.log(`Invalid id ${req.params.id}`);
    res
      .status(400)
      .send({ error: "Invalid id, " + req.params.id + " is not a valid uuid" });
  }
};

exports.getCommandsByServedById = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting commands with served by id ${req.params.id}`);
      connection.query(
        "SELECT * FROM commands WHERE servedBy_id = ? AND deleted_at IS null",
        [req.params.id],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log("Number of commands found: " + result.length + "");
            res.send(result);
          } else {
            console.log("No commands found");
            res.status(404).send({
              error: "No commands found for the served by id " + req.params.id,
            });
          }
        }
      );
    });
  } else {
    console.log(`Invalid id ${req.params.id}`);
    res
      .status(400)
      .send({ error: "Invalid id, " + req.params.id + " is not a valid uuid" });
  }
};

exports.getServedCommands = (req, res) => {
  if (req.query.clientId) {
    if (uuid.validate(req.query.clientId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(
          `Getting served commands with client id ${req.query.clientId}`
        );
        connection.query(
          "SELECT * FROM commands WHERE client_id = ? AND isServed = 1 AND deleted_at IS null",
          [req.query.clientId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log("Number of commands found: " + result.length + "");
              res.send(result);
            } else {
              console.log("No commands found");
              res.status(404).send({
                error:
                  "No commands found for the client id " + req.query.clientId,
              });
            }
          }
        );
      });
    } else {
      console.log(`Invalid id ${req.query.clientId}`);
      res.status(400).send({
        error:
          "Invalid id, " + req.query.clientId + " is not a valid client uuid",
      });
    }
  } else if (req.query.eventId) {
    if (uuid.validate(req.query.eventId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(
          `Getting served commands with client id ${req.query.eventId}`
        );
        connection.query(
          "SELECT * FROM commands WHERE event_id = ? AND isServed = 1 AND deleted_at IS null",
          [req.query.eventId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log("Number of commands found: " + result.length + "");
              res.send(result);
            } else {
              console.log("No commands found");
              res.status(404).send({
                error:
                  "No commands found for the event id " + req.query.eventId,
              });
            }
          }
        );
      });
    } else {
      console.log(`Invalid id ${req.query.eventId}`);
      res.status(400).send({
        error:
          "Invalid id, " + req.query.eventId + " is not a valid client uuid",
      });
    }
  } else {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT * FROM commands WHERE isserved = 1 AND deleted_at IS null",
        (err, result) => {
          connection.release();
          if (err) throw err;
          res.send(result);
        }
      );
    });
  }
};

exports.getPaidCommands = (req, res) => {
  if (req.query.clientId) {
    if (uuid.validate(req.query.clientId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(
          `Getting paid commands with client id ${req.query.clientId}`
        );
        connection.query(
          "SELECT * FROM commands WHERE client_id = ? AND isPaid = 1 AND deleted_at IS null",
          [req.query.clientId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log("Number of commands found: " + result.length + "");
              res.send(result);
            } else {
              console.log("No commands found");
              res.status(404).send({
                error:
                  "No commands found for the client id " + req.query.clientId,
              });
            }
          }
        );
      });
    } else {
      console.log(`Invalid id ${req.query.clientId}`);
      res.status(400).send({
        error:
          "Invalid id, " + req.query.clientId + " is not a valid client uuid",
      });
    }
  } else if (req.query.eventId) {
    if (uuid.validate(req.query.eventId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(
          `Getting paid commands with client id ${req.query.eventId}`
        );
        connection.query(
          "SELECT * FROM commands WHERE event_id = ? AND isPaid = 1 AND deleted_at IS null",
          [req.query.eventId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log("Number of commands found: " + result.length + "");
              res.send(result);
            } else {
              console.log("No commands found");
              res.status(404).send({
                error:
                  "No commands found for the event id " + req.query.eventId,
              });
            }
          }
        );
      });
    } else {
      console.log(`Invalid id ${req.query.eventId}`);
      res.status(400).send({
        error:
          "Invalid id, " + req.query.eventId + " is not a valid client uuid",
      });
    }
  } else {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT * FROM commands WHERE ispaid = 1 AND deleted_at IS null",
        (err, result) => {
          connection.release();
          if (err) throw err;
          res.send(result);
        }
      );
    });
  }
};

exports.getUnservedCommands = (req, res) => {
  if (req.query.clientId) {
    if (uuid.validate(req.query.clientId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(
          `Getting unserved commands with client id ${req.query.clientId}`
        );
        connection.query(
          "SELECT * FROM commands WHERE client_id = ? AND isServed = 0 AND deleted_at IS null",
          [req.query.clientId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log("Number of commands found: " + result.length + "");
              res.send(result);
            } else {
              console.log("No commands found");
              res.status(404).send({
                error:
                  "No commands found for the client id " + req.query.clientId,
              });
            }
          }
        );
      });
    } else {
      console.log(`Invalid id ${req.query.clientId}`);
      res.status(400).send({
        error:
          "Invalid id, " + req.query.clientId + " is not a valid client uuid",
      });
    }
  } else if (req.query.eventId) {
    if (uuid.validate(req.query.eventId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(
          `Getting unserved commands with client id ${req.query.eventId}`
        );
        connection.query(
          "SELECT * FROM commands WHERE event_id = ? AND isServed = 0 AND deleted_at IS null",
          [req.query.eventId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log("Number of commands found: " + result.length + "");
              res.send(result);
            } else {
              console.log("No commands found");
              res.status(404).send({
                error:
                  "No commands found for the event id " + req.query.eventId,
              });
            }
          }
        );
      });
    } else {
      console.log(`Invalid id ${req.query.eventId}`);
      res.status(400).send({
        error:
          "Invalid id, " + req.query.eventId + " is not a valid client uuid",
      });
    }
  } else {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT * FROM commands WHERE isserved = 0 AND deleted_at IS null",
        (err, result) => {
          connection.release();
          if (err) throw err;
          res.send(result);
        }
      );
    });
  }
};

exports.getUnpaidCommands = (req, res) => {
  if (req.query.clientId) {
    if (uuid.validate(req.query.clientId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(
          `Getting unpaid commands with client id ${req.query.clientId}`
        );
        connection.query(
          "SELECT * FROM commands WHERE client_id = ? AND isPaid = 0 AND deleted_at IS null",
          [req.query.clientId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log("Number of commands found: " + result.length + "");
              res.send(result);
            } else {
              console.log("No commands found");
              res.status(404).send({
                error:
                  "No commands found for the client id " + req.query.clientId,
              });
            }
          }
        );
      });
    } else {
      console.log(`Invalid id ${req.query.clientId}`);
      res.status(400).send({
        error:
          "Invalid id, " + req.query.clientId + " is not a valid client uuid",
      });
    }
  } else if (req.query.eventId) {
    if (uuid.validate(req.query.eventId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(
          `Getting unpaid commands with client id ${req.query.eventId}`
        );
        connection.query(
          "SELECT * FROM commands WHERE event_id = ? AND isPaid = 0 AND deleted_at IS null",
          [req.query.eventId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log("Number of commands found: " + result.length + "");
              res.send(result);
            } else {
              console.log("No commands found");
              res.status(404).send({
                error:
                  "No commands found for the event id " + req.query.eventId,
              });
            }
          }
        );
      });
    } else {
      console.log(`Invalid id ${req.query.eventId}`);
      res.status(400).send({
        error:
          "Invalid id, " + req.query.eventId + " is not a valid client uuid",
      });
    }
  } else {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT * FROM commands WHERE ispaid = 0 AND deleted_at IS null",
        (err, result) => {
          connection.release();
          if (err) throw err;
          res.send(result);
        }
      );
    });
  }
};

exports.createCommand = (req, res) => {
  if (req.body.eventId === null) {
    res.status(400).send({ error: "No event id provided" });
  } else if (uuid.validate(req.body.eventId)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "SELECT id FROM events WHERE id = ? AND deleted_at IS null",
        [req.body.eventId],
        (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length <= 0) {
            res
              .status(404)
              .send({ error: "No event found with the id provided" });
          }
        }
      );
    });
  }
  if (req.body.clientId != null && uuid.validate(req.body.clientId)) {
    if (req.body.sellerId != null) {
      if (uuid.validate(req.body.sellerId)) {
        pool.getConnection((err, connection) => {
          if (err) throw err;
          connection.query(
            "SELECT firstname, lastname FROM users WHERE id = ? AND deleted_at IS null",
            [req.body.clientId],
            (err, result) => {
              if (err) throw err;
              if (result.length > 0) {
                const commandId = uuid.v4();
                const clientName =
                  result[0].firstname + " " + result[0].lastname;
                connection.query(
                  "INSERT INTO commands (id, client_id, client_name, servedby_id, event_id, isserved, ispaid, created_at, deleted_at) VALUES (?, ?, ?, ?, ?, 0, 0, NOW(), NULL)",
                  [
                    commandId,
                    req.body.clientId,
                    clientName,
                    req.body.sellerId,
                    req.body.eventId,
                  ],
                  (err, result) => {
                    connection.release();
                    if (err) throw err;
                    console.log("Command created");
                    res.status(200).send({
                      success: "Command created successfully",
                      commandId: commandId,
                    });
                  }
                );
              } else {
                res
                  .status(404)
                  .send({ error: "No user found with the client id provided" });
              }
            }
          );
        });
      } else {
        res.status(400).send({ error: "The sellerId provided is not valid" });
      }
    } else {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "SELECT firstname, lastname FROM users WHERE id = ? AND deleted_at IS null",
          [req.body.clientId],
          (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
              const commandId = uuid.v4();
              const clientName = result[0].firstname + " " + result[0].lastname;
              connection.query(
                "INSERT INTO commands (id, client_id, client_name, servedby_id, event_id, isserved, ispaid, created_at, deleted_at) VALUES (?, ?, ?, NULL, ?, 0, 0, NOW(), NULL)",
                [commandId, req.body.clientId, clientName, req.body.eventId],
                (err, result) => {
                  connection.release();
                  if (err) throw err;
                  console.log("Command created");
                  res.status(200).send({
                    success: "Command created successfully",
                    commandId: commandId,
                  });
                }
              );
            } else {
              res
                .status(404)
                .send({ error: "No user found with the client id provided" });
            }
          }
        );
      });
    }
  } else if (req.body.clientId === null && req.body.clientName != null) {
    if (req.body.sellerId != null) {
      if (uuid.validate(req.body.sellerId)) {
        pool.getConnection((err, connection) => {
          if (err) throw err;
          connection.query(
            "SELECT id FROM users WHERE id = ? AND deleted_at IS NULL",
            [req.body.sellerId],
            (err, result) => {
              if (err) throw err;
              if (result.length > 0) {
                const commandId = uuid.v4();
                connection.query(
                  "INSERT INTO commands (id, client_id, client_name, servedby_id, event_id, isserved, ispaid, created_at, deleted_at) VALUES (?, NULL, ?, ?, ?, 0, 0, NOW(), NULL)",
                  [commandId, clientName, req.body.sellerId, req.body.eventId],
                  (err, result) => {
                    connection.release();
                    if (err) throw err;
                    console.log("Command created");
                    res.status(200).send({
                      success: "Command created successfully",
                      commandId: commandId,
                    });
                  }
                );
              } else {
                res
                  .status(404)
                  .send({ error: "No user found with the seller id provided" });
              }
            }
          );
        });
      } else {
        res.status(400).send({ error: "The sellerId provided is not valid" });
      }
    } else {
      const commandId = uuid.v4();
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "INSERT INTO commands (id, client_id, client_name, servedby_id, event_id, isserved, ispaid, created_at, deleted_at) VALUES (?, NULL, ?, NULL, ?, 0, 0, NOW(), NULL)",
          [commandId, req.body.clientName, req.body.eventId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            console.log("Command created");
            res.status(200).send({
              success: "Command created successfully",
              commandId: commandId,
            });
          }
        );
      });
    }
  } else {
    res.status(400).send({ error: "A client id or a client name is required" });
  }
};

exports.setCommandServedState = (req, res) => {
  if (uuid.validate(req.params.commandId)) {
    if (req.body.served === 0 || req.body.served === 1) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "UPDATE commands SET isserved = ? WHERE id = ? AND deleted_at IS null",
          [req.body.served, req.params.commandId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            console.log("Command served = " + req.body.served);
            res.send(result);
          }
        );
      });
    } else {
      console.log("Invalid served value");
      res.status(400).send({ error: "Served value must be 0 or 1" });
    }
  } else {
    console.log(`Invalid id ${req.params.commandId}`);
    res.status(400).send({
      error:
        "Invalid id, " + req.params.commandId + " is not a valid command uuid",
    });
  }
};

exports.setCommandPaidState = (req, res) => {
  if (uuid.validate(req.params.commandId)) {
    if (req.body.paid === 0 || req.body.paid === 1) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(
          "UPDATE commands SET ispaid = ? WHERE id = ? AND deleted_at IS null",
          [req.body.paid, req.params.commandId],
          (err, result) => {
            connection.release();
            if (err) throw err;
            console.log("Command paid = " + req.body.paid);
            res.send(result);
          }
        );
      });
    } else {
      console.log("Invalid paid value");
      res.status(400).send({ error: "Paid value must be 0 or 1" });
    }
  } else {
    console.log(`Invalid id ${req.params.commandId}`);
    res.status(400).send({
      error:
        "Invalid id, " + req.params.commandId + " is not a valid command uuid",
    });
  }
};

exports.deleteCommand = (req, res) => {
  if (uuid.validate(req.params.commandId)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(
        "UPDATE commands SET deleted_at = NOW() WHERE id = ?",
        [req.params.commandId],
        (err, resul) => {
          connection.release();
          if (err) throw err;
          console.log("Command deleted");
          res.send(resul);
        }
      );
    });
  } else {
    console.log(`Invalid id ${req.params.commandId}`);
    res.status(400).send({
      error:
        "Invalid id, " + req.params.commandId + " is not a valid command uuid",
    });
  }
};
