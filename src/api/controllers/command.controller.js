const uuid = require('uuid');
const database = require('../../database.js');
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
    connection.query('SELECT * FROM commands WHERE deleted_at IS null', (err, result) => {
      connection.release();
      if (err) throw err;
      res.send(result);
    });
  });
}

exports.getCommandById = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting command with id ${req.params.id}`);
      connection.query('SELECT * FROM commands WHERE id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          console.log('Number of commands found: ' + result.length + '');
          res.send(result);
        } else {
          console.log('No commands found');
          res.status(404).send({ 'error': 'No commands found for the id ' + req.params.id });
        }
      });
    });
  } else {
    console.log(`Invalid id ${req.params.id}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.params.id + ' is not a valid uuid' });
  }
}

exports.getCommandsByClientId = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting commands with client id ${req.params.id}`);
      connection.query('SELECT * FROM commands WHERE client_id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          console.log('Number of commands found: ' + result.length + '');
          res.send(result);
        } else {
          console.log('No commands found');
          res.status(404).send({ 'error': 'No commands found for the client id ' + req.params.id });
        }
      });
    });
  } else {
    console.log(`Invalid id ${req.params.id}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.params.id + ' is not a valid uuid' });
  }
}

exports.getCommandsByEventId = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting commands with event id ${req.params.id}`);
      connection.query('SELECT * FROM commands WHERE event_id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          console.log('Number of commands found: ' + result.length + '');
          res.send(result);
        } else {
          console.log('No commands found');
          res.status(404).send({ 'error': 'No commands found for the event id ' + req.params.id });
        }
      });
    });
  } else {
    console.log(`Invalid id ${req.params.id}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.params.id + ' is not a valid uuid' });
  }
}

exports.getCommandsByServedById = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`Getting commands with served by id ${req.params.id}`);
      connection.query('SELECT * FROM commands WHERE servedBy_id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
        connection.release();
        if (err) throw err;
        if (result.length > 0) {
          console.log('Number of commands found: ' + result.length + '');
          res.send(result);
        } else {
          console.log('No commands found');
          res.status(404).send({ 'error': 'No commands found for the served by id ' + req.params.id });
        }
      });
    });
  } else {
    console.log(`Invalid id ${req.params.id}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.params.id + ' is not a valid uuid' });
  }
}

exports.getServedCommands = (req, res) => {
  if (req.query.clientId) {
    if (uuid.validate(req.query.clientId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Getting served commands with client id ${req.query.clientId}`);
        connection.query('SELECT * FROM commands WHERE client_id = ? AND isServed = 1 AND deleted_at IS null', [req.query.clientId], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of commands found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No commands found');
            res.status(404).send({ 'error': 'No commands found for the client id ' + req.query.clientId });
          }
        });
      });
    } else {
      console.log(`Invalid id ${req.query.clientId}`);
      res.status(400).send({ 'error': 'Invalid id, ' + req.query.clientId + ' is not a valid client uuid' });
    }
  } else if (req.query.eventId) {
    if (uuid.validate(req.query.eventId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Getting served commands with client id ${req.query.eventId}`);
        connection.query('SELECT * FROM commands WHERE event_id = ? AND isServed = 1 AND deleted_at IS null', [req.query.eventId], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of commands found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No commands found');
            res.status(404).send({ 'error': 'No commands found for the event id ' + req.query.eventId });
          }
        });
      });
    } else {
      console.log(`Invalid id ${req.query.eventId}`);
      res.status(400).send({ 'error': 'Invalid id, ' + req.query.eventId + ' is not a valid client uuid' });
    }
  } else {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT * FROM commands WHERE isserved = 1 AND deleted_at IS null', (err, result) => {
        connection.release();
        if (err) throw err;
        res.send(result);
      });
    });
  }
}

exports.getPaidCommands = (req, res) => {
  if (req.query.clientId) {
    if (uuid.validate(req.query.clientId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Getting paid commands with client id ${req.query.clientId}`);
        connection.query('SELECT * FROM commands WHERE client_id = ? AND isPaid = 1 AND deleted_at IS null', [req.query.clientId], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of commands found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No commands found');
            res.status(404).send({ 'error': 'No commands found for the client id ' + req.query.clientId });
          }
        });
      });
    } else {
      console.log(`Invalid id ${req.query.clientId}`);
      res.status(400).send({ 'error': 'Invalid id, ' + req.query.clientId + ' is not a valid client uuid' });
    }
  } else if (req.query.eventId) {
    if (uuid.validate(req.query.eventId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Getting paid commands with client id ${req.query.eventId}`);
        connection.query('SELECT * FROM commands WHERE event_id = ? AND isPaid = 1 AND deleted_at IS null', [req.query.eventId], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of commands found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No commands found');
            res.status(404).send({ 'error': 'No commands found for the event id ' + req.query.eventId });
          }
        });
      });
    } else {
      console.log(`Invalid id ${req.query.eventId}`);
      res.status(400).send({ 'error': 'Invalid id, ' + req.query.eventId + ' is not a valid client uuid' });
    }
  } else {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT * FROM commands WHERE ispaid = 1 AND deleted_at IS null', (err, result) => {
        connection.release();
        if (err) throw err;
        res.send(result);
      });
    });
  }
}

exports.getUnservedCommands = (req, res) => {
  if (req.query.clientId) {
    if (uuid.validate(req.query.clientId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Getting unserved commands with client id ${req.query.clientId}`);
        connection.query('SELECT * FROM commands WHERE client_id = ? AND isServed = 0 AND deleted_at IS null', [req.query.clientId], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of commands found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No commands found');
            res.status(404).send({ 'error': 'No commands found for the client id ' + req.query.clientId });
          }
        });
      });
    } else {
      console.log(`Invalid id ${req.query.clientId}`);
      res.status(400).send({ 'error': 'Invalid id, ' + req.query.clientId + ' is not a valid client uuid' });
    }
  } else if (req.query.eventId) {
    if (uuid.validate(req.query.eventId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Getting unserved commands with client id ${req.query.eventId}`);
        connection.query('SELECT * FROM commands WHERE event_id = ? AND isServed = 0 AND deleted_at IS null', [req.query.eventId], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of commands found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No commands found');
            res.status(404).send({ 'error': 'No commands found for the event id ' + req.query.eventId });
          }
        });
      });
    } else {
      console.log(`Invalid id ${req.query.eventId}`);
      res.status(400).send({ 'error': 'Invalid id, ' + req.query.eventId + ' is not a valid client uuid' });
    }
  } else {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT * FROM commands WHERE isserved = 0 AND deleted_at IS null', (err, result) => {
        connection.release();
        if (err) throw err;
        res.send(result);
      });
    });
  }
}

exports.getUnpaidCommands = (req, res) => {
  if (req.query.clientId) {
    if (uuid.validate(req.query.clientId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Getting unpaid commands with client id ${req.query.clientId}`);
        connection.query('SELECT * FROM commands WHERE client_id = ? AND isPaid = 0 AND deleted_at IS null', [req.query.clientId], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of commands found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No commands found');
            res.status(404).send({ 'error': 'No commands found for the client id ' + req.query.clientId });
          }
        });
      });
    } else {
      console.log(`Invalid id ${req.query.clientId}`);
      res.status(400).send({ 'error': 'Invalid id, ' + req.query.clientId + ' is not a valid client uuid' });
    }
  } else if (req.query.eventId) {
    if (uuid.validate(req.query.eventId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        console.log(`Getting unpaid commands with client id ${req.query.eventId}`);
        connection.query('SELECT * FROM commands WHERE event_id = ? AND isPaid = 0 AND deleted_at IS null', [req.query.eventId], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of commands found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No commands found');
            res.status(404).send({ 'error': 'No commands found for the event id ' + req.query.eventId });
          }
        });
      });
    } else {
      console.log(`Invalid id ${req.query.eventId}`);
      res.status(400).send({ 'error': 'Invalid id, ' + req.query.eventId + ' is not a valid client uuid' });
    }
  } else {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT * FROM commands WHERE ispaid = 0 AND deleted_at IS null', (err, result) => {
        connection.release();
        if (err) throw err;
        res.send(result);
      });
    });
  }
}

exports.createCommand = (req, res) => {
  if (uuid.validate(req.body.clientId)) {
    if (uuid.validate(req.body.servedBy_id)) {
      if (uuid.validate(req.body.eventId)) {
        let newCommand = new Command(req.body.clientId, req.body.servedBy_id, req.body.eventId, 0, 0);
        pool.getConnection((err, connection) => {
          if (err) throw err;
          connection.query('INSERT INTO commands (id, client_id, servedby_id, event_id, isserved, ispaid, created_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [newCommand.id, newCommand.client_id, newCommand.servedBy_id, newCommand.event_id, newCommand.isServed, newCommand.isPaid, newCommand.created_at, newCommand.deleted_at], (err, result) => {
            connection.release();
            if (err) throw err;
            console.log('Command created');
            res.send(result);
          });
        });
      } else {
        console.log(`Invalid id ${eventId}`);
        res.status(400).send({ 'error': 'Invalid id, ' + eventId + ' is not a valid event uuid' });
      }
    } else {
      console.log(`Invalid id ${req.body.servedBy_id}`);
      res.status(400).send({ 'error': 'Invalid id, ' + req.body.servedBy_id + ' is not a valid served by uuid' });
    }
  } else {
    console.log(`Invalid id ${req.body.clientId}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.body.clientId + ' is not a valid client uuid' });
  }
}

exports.setCommandServedState = (req, res) => {
  if (uuid.validate(req.params.commandId)) {
    if (req.body.served === 0 || req.body.served === 1) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('UPDATE commands SET isserved = ? WHERE id = ? AND deleted_at IS null', [req.body.served, req.params.commandId], (err, result) => {
          connection.release();
          if (err) throw err;
          console.log('Command served');
          res.send(result);
        });
      });
    } else {
      console.log('Invalid served value');
      res.status(400).send({ 'error': 'Served value must be 0 or 1' });
    }
  } else {
    console.log(`Invalid id ${req.params.commandId}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.params.commandId + ' is not a valid command uuid' });
  }
}