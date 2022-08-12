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