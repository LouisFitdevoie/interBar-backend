const uuid = require('uuid');
const database = require('../../database.js');
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
    connection.query('SELECT * FROM events_products_commands WHERE deleted_at IS null', (err, result) => {
      connection.release();
      if (err) throw err;
      res.send(result);
    }
    );
  }
  );
}

exports.getEventProductCommandById = (req, res) => {
  if (uuid.validate(req.params.id)) { //Verify that the id is a valid uuid
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting event product command with id ${req.params.id}`);
      connection.query('SELECT * FROM events_products_commands WHERE id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
        connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of event product commands found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No event product commands found');
            res.status(404).send({ 'error': 'No event product commands found for the id ' + req.params.id });
          }
      }
      );
    }
    );
  } else {
    console.log(`Invalid id ${req.params.id}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.params.id + ' is not a valid uuid' });
  }
}

exports.getEventProductsCommandsForCommandId = (req, res) => {
  if (uuid.validate(req.params.id)) { //Verify that the id is a valid uuid
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting event products commands for command id ${req.params.id}`);
      connection.query('SELECT * FROM events_products_commands WHERE command_id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
        connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of event products commands found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No event products commands found');
            res.status(404).send({ 'error': 'No event products commands found for the command id ' + req.params.id });
          }
      }
      );
    }
    );
  } else {
    console.log(`Invalid id ${req.params.id}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.params.id + ' is not a valid uuid' });
  }
}

exports.getNumber = (req, res) => {
  if (uuid.validate(req.query.commandId)) {
    if (uuid.validate(req.query.eventProductId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Getting number for command id ${req.query.commandId} and event product id ${req.query.eventProductId}`);
        connection.query('SELECT number FROM events_products_commands WHERE command_id = ? AND event_product_id = ? AND deleted_at IS null', [req.query.commandId, req.query.eventProductId], (err, result) => {
          connection.release();
            if (err) throw err;
            if (result.length > 0) {
              console.log('Number of event products commands found: ' + result.length + '');
              res.send(result);
            } else {
              console.log('No event products commands found');
              res.status(404).send({ 'error': 'No event products commands found for the command id ' + req.query.commandId + ' and event product id ' + req.query.eventProductId });
            }
        }
        );
      }
      );
    } else {
      console.log(`Invalid id ${req.query.eventProductId}`);
      res.status(400).send({ 'error': 'Invalid id, ' + req.query.eventProductId + ' is not a valid uuid' });
    }
  } else {
    console.log(`Invalid command id ${req.query.commandId}`);
    res.status(400).send({ 'error': `Invalid command id ${req.query.commandId}` });
  }
}

exports.getAllInfosForProductCommand = (req, res) => {
  if (uuid.validate(req.params.commandId)) {
    let objectToReturn = {
      command: {
        event_id: '',
        isServed: '',
        isPaid: '',
        created_at: ''
      },
      products: [],
      seller: {
        id: '',
        firstName: '',
        lastName: '',
        birthday: '',
        emailAddress: ''
      },
      client: {
        id: '',
        firstName: '',
        lastName: '',
        birthday: '',
        emailAddress: ''
      }
    }
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting all infos for command id ${req.params.commandId}`);
      connection.query('SELECT id, client_id, servedby_id, event_id, isserved, ispaid, created_at FROM commands WHERE id = ? AND deleted_at IS null', [req.params.commandId], (err, result) => {
        if (err) throw err;
          if (result.length === 1) {
            let commandId = result[0].id;
            let clientId = result[0].client_id;
            let sellerId = result[0].servedby_id;
            objectToReturn.command.event_id = result[0].event_id;
            objectToReturn.command.isServed = result[0].isserved;
            objectToReturn.command.isPaid = result[0].ispaid;
            objectToReturn.command.created_at = result[0].created_at;
            connection.query('SELECT events_products_commands.event_product_id, events_products_commands.number, events_products.product_id, events_products.sellingprice, products.name, products.category, products.description FROM events_products_commands INNER JOIN events_products ON events_products_commands.event_product_id = events_products.id INNER JOIN products ON events_products.product_id = products.id WHERE events_products_commands.command_id = ? AND events_products_commands.deleted_at IS null', [commandId], (err, result) => {
              if (err) throw err;
              if (result.length > 0) {
                
                let products_table = [];
                result.forEach(product => {
                  products_table.push({
                    name: product.name,
                    category: product.category,
                    description: product.description,
                    sellingPrice: product.sellingprice,
                    number: product.number
                  });
                });

                objectToReturn.products = products_table;

                connection.query('SELECT id, firstname, lastname, birthday, emailaddress FROM users WHERE id = ? AND deleted_at IS null', [sellerId], (err, result) => {
                  if (err) throw err;
                  if (result.length === 1) {
                    objectToReturn.seller.id = result[0].id;
                    objectToReturn.seller.firstName = result[0].firstname;
                    objectToReturn.seller.lastName = result[0].lastname;
                    objectToReturn.seller.birthday = result[0].birthday;
                    objectToReturn.seller.emailAddress = result[0].emailaddress;
                    connection.query('SELECT id, firstname, lastname, birthday, emailaddress FROM users WHERE id = ? AND deleted_at IS null', [clientId], (err, result) => {
                      connection.release();
                      if (err) throw err;
                      if (result.length === 1) {
                        objectToReturn.client.id = result[0].id;
                        objectToReturn.client.firstName = result[0].firstname;
                        objectToReturn.client.lastName = result[0].lastname;
                        objectToReturn.client.birthday = result[0].birthday;
                        objectToReturn.client.emailAddress = result[0].emailaddress;
                        res.send(objectToReturn);
                      } else {
                        connection.release();
                        console.log('No client found');
                        res.status(404).send({ 'error': 'No client found for the client id ' + objectToReturn.command.client_id });
                      }
                    }
                    );
                  } else {
                    connection.release();
                    console.log('No seller found');
                    res.status(404).send({ 'error': 'No seller found for the servedby id ' + objectToReturn.command.servedBy_id });
                  }
                });

              } else {
                connection.release();
                console.log('No event products commands found');
                res.status(404).send({ 'error': 'No event products commands found for the command id ' + req.body.commandId });
              }
            });
          } else {
            connection.release();
            console.log('No commands found');
            res.status(404).send({ 'error': 'No commands found for the command id ' + req.body.commandId });
          }
      });
    }
    );
  } else {
    console.log(`Invalid id ${req.body.commandId}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.body.commandId + ' is not a valid command uuid' });
  }
}