const uuid = require('uuid');
const database = require('../../database.js');
const pool = database.pool;

class Event {
  constructor(name, startDate, endDate, location, description) {
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
    this.description = description;
  }
  id = uuid.v4();
  name;
  startDate;
  endDate;
  location;
  description = null;
  created_at = new Date();
  deleted_at = null;
}

exports.getAllEvents = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query('SELECT * FROM events WHERE deleted_at IS null ORDER BY name', (err, result) => {
      connection.release();
      if (err) throw err;
      res.send(result);
    });
  });
}

exports.getEventById = (req, res) => {
  if (uuid.validate(req.query.id)) { //Verify that the id is a valid uuid
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log(`\n\n\nGetting product with id ${req.query.id}`);
      connection.query('SELECT * FROM events WHERE id = ? AND deleted_at IS null', [req.query.id], (err, result) => {
        connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of events found: ' + result.length + '\n\n\n');
            res.send(result);
          } else {
            console.log('No events found\n\n\n');
            res.status(404).send({ 'error': 'No events found for the id ' + req.query.id });
          }
      });
    });
  } else {
    console.log(`Invalid id ${req.query.id}`);
    res.status(400).send({ 'error': 'Invalid id, ' + req.query.id + ' is not a valid uuid' });
  }
}

exports.getEventByName = (req, res) => {
  //
  //NEED TO VERIFY THE NAME
  pool.getConnection((err, connection) => {
    console.log('\n\n\nGetting events with name ' + req.query.name);
    connection.query('SELECT * FROM events WHERE name LIKE ? AND deleted_at IS null', '%' + req.query.name + '%', function (err, result) {
      connection.release();
      if (err) throw err;
      if (result.length > 0) {
        console.log('Number of events found: ' + result.length + '\n\n\n');
        res.send(result);
      } else {
        console.log('No events found\n\n\n');
        res.status(404).send({ 'error': 'No events found for the name ' + req.query.name });
      }
    });
  });
}

exports.getEventBetweenDates = (req, res) => {
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;
  if (startDate > endDate) {
    console.log('Start date is after end date');
    res.status(400).send({ 'error': 'Start date is after end date' });
  } else {
    if (req.body.mode === 'start') {
      console.log('\n\n\nGetting events where startDate between ' + startDate + ' and ' + endDate);
      res.status(200).send({ 'message': 'Getting events where startDate between ' + startDate + ' and ' + endDate });
    } else if (req.body.mode === 'end') {
      console.log('\n\n\nGetting events where endDate between ' + startDate + ' and ' + endDate);
      res.status(200).send({ 'message': 'Getting events where endDate between ' + startDate + ' and ' + endDate });
    } else if (req.body.mode === 'both') {
      console.log('\n\n\nGetting events where both start and end dates between ' + startDate + ' and ' + endDate);
      res.status(200).send({ 'message': 'Getting events where both start and end dates between ' + startDate + ' and ' + endDate });
    } else {
      console.log('No mode specified');
      res.status(400).send({ 'error': 'No mode specified' });
    }
  }
}