const uuid = require('uuid');
const database = require('../../database.js');
const isAfter = require('date-fns/isAfter');

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
    connection.query('SELECT * FROM events WHERE deleted_at IS null ORDER BY startDate', (err, result) => {
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
      console.log(`Getting product with id ${req.query.id}`);
      connection.query('SELECT * FROM events WHERE id = ? AND deleted_at IS null', [req.query.id], (err, result) => {
        connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of events found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No events found');
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
    console.log('Getting events with name ' + req.query.name);
    connection.query('SELECT * FROM events WHERE name LIKE ? AND deleted_at IS null ORDER BY startDate', '%' + req.query.name + '%', function (err, result) {
      connection.release();
      if (err) throw err;
      if (result.length > 0) {
        console.log('Number of events found: ' + result.length + '');
        res.send(result);
      } else {
        console.log('No events found');
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
      console.log('Getting events where startDate between ' + startDate + ' and ' + endDate);
      pool.getConnection((err, connection) => {
        connection.query('SELECT * FROM events WHERE startDate between ? and ? AND deleted_at IS null ORDER BY startDate', [startDate, endDate], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of events found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No events found');
            res.status(404).send({ 'error': 'No events found between ' + startDate + ' and ' + endDate });
          }
        });
      });
    } else if (req.body.mode === 'end') {
      console.log('Getting events where endDate between ' + startDate + ' and ' + endDate);
      pool.getConnection((err, connection) => {
        connection.query('SELECT * FROM events WHERE endDate between ? and ? AND deleted_at IS null ORDER BY startDate', [startDate, endDate], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of events found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No events found');
            res.status(404).send({ 'error': 'No events found between ' + startDate + ' and ' + endDate });
          }
        });
      });
    } else if (req.body.mode === 'both') {
      console.log('Getting events where both start and end dates between ' + startDate + ' and ' + endDate);
      pool.getConnection((err, connection) => {
        connection.query('SELECT * FROM events WHERE startDate between ? and ? AND endDate between ? and ? AND deleted_at IS null ORDER BY startDate', [startDate, endDate, startDate, endDate], (err, result) => {
          connection.release();
          if (err) throw err;
          if (result.length > 0) {
            console.log('Number of events found: ' + result.length + '');
            res.send(result);
          } else {
            console.log('No events found');
            res.status(404).send({ 'error': 'No events found between ' + startDate + ' and ' + endDate });
          }
        });
      });
    } else {
      console.log('No mode specified');
      res.status(400).send({ 'error': 'No mode specified' });
    }
  }
}

exports.getFutureEvents = (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query('SELECT * FROM events WHERE startDate > NOW() AND deleted_at IS null ORDER BY startDate', (err, result) => {
      connection.release();
      if (err) throw err;
      if (result.length > 0) {
        console.log('Number of events found: ' + result.length + '');
        res.send(result);
      } else {
        console.log('No future events found');
        res.status(404).send({ 'error': 'No future events found' });
      }
    });
  });
}

exports.getCurrentEvents = (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query('SELECT * FROM events WHERE startDate <= NOW() AND endDate >= NOW() AND deleted_at IS null ORDER BY startDate', (err, result) => {
      connection.release();
      if (err) throw err;
      if (result.length > 0) {
        console.log('Number of events found: ' + result.length + '');
        res.send(result);
      } else {
        console.log('No current events found');
        res.status(404).send({ 'error': 'No current events found' });
      }
    });
  });
}

exports.getPastEvents = (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query('SELECT * FROM events WHERE endDate < NOW() AND deleted_at IS null ORDER BY startDate', (err, result) => {
      connection.release();
      if (err) throw err;
      if (result.length > 0) {
        console.log('Number of events found: ' + result.length + '');
        res.send(result);
      } else {
        console.log('No past events found');
        res.status(404).send({ 'error': 'No past events found' });
      }
    });
  });
}

exports.createEvent = (req, res) => {
  console.log('Verifying data for event creation');
  if (isAfter(new Date(req.body.startDate), new Date())) {
    if (isAfter(new Date(req.body.endDate), new Date(req.body.startDate))) {
      if (req.body.name.trim().length > 0) {
        if (req.body.location.trim().length > 0) {
          let eventToCreate = new Event(req.body.name.trim(), req.body.startDate, req.body.endDate, req.body.location.trim(), req.body.description ? req.body.description.trim() : null);
          pool.getConnection((err, connection) => {
            if (err) throw err;
            connection.query('SELECT * FROM events WHERE (name = ? AND startDate = ? AND endDate = ? AND location = ? AND deleted_at IS null)', [eventToCreate.name, eventToCreate.startDate, eventToCreate.endDate, eventToCreate.location], (err, result) => {
              if (err) throw err;
              if (result.length > 0) {
                connection.release();
                console.log('Event already exists');
                res.status(400).send({ 'error': 'Event already exists' });
              } else {
                connection.query('INSERT INTO events (id, name, startDate, endDate, location, description, created_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [eventToCreate.id, eventToCreate.name, eventToCreate.startDate, eventToCreate.endDate, eventToCreate.location, eventToCreate.description, eventToCreate.created_at, eventToCreate.deleted_at], (err, result) => {
                  connection.release();
                  if (err) throw err;
                  console.log('Event created');
                  res.status(200).send({ 'success': 'Event created successfully'});
                });
              }
            });
          });
        } else {
          res.status(404).send({ 'error': 'No location specified' });
        }
      } else {
        res.status(404).send({ 'error': 'Name is required' });
      }
    } else {
      res.status(404).send({ 'error': 'End date is before start date' });
    }
  } else {
    res.status(404).send({ 'error': 'Start date is before current date' });
  }
}

exports.deleteEvent = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT * FROM events WHERE id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
        if (err) throw err;
        if (result.length != 1) {
          connection.release();
          console.log('Event with id ' + req.params.id + ' does not exist');
          res.status(404).send({ 'error': 'Event with id ' + req.params.id + ' does not exist' });
        } else {
          console.log('Event product with id ' + req.params.id);
          connection.query('UPDATE events SET deleted_at = NOW() WHERE id = ?', [req.params.id], (err, result) => {
            connection.release();
            if (err) throw err;
            console.log('Event deleted');
            res.status(200).send({ 'success': 'Event deleted successfully', 'result': result });
          });
        }
      });
    });
  } else {
    res.status(404).send({ 'error': 'Invalid id, ' + req.query.id + ' is not a valid uuid' });
  }
}