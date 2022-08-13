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
  if (uuid.validate(req.query.id)) { //Verify that the id is a valid uuid
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting event product command with id ${req.query.id}`);
      connection.query('SELECT * FROM events_products_commands WHERE id = ? AND deleted_at IS null', [req.query.id], (err, result) => {
        connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of event product commands found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No event product commands found');
            res.status(404).send({ 'error': 'No event product commands found for the id ' + req.query.id });
          }
      }
      );
    }
    );
  } else {
    console.log(`Invalid id ${req.query.id}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.query.id + ' is not a valid uuid' });
  }
}