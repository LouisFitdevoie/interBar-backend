const uuid = require('uuid');
const database = require('../../database.js');
const pool = database.pool;

class UserEvent {
  constructor(user_id, event_id, role) {
    this.user_id = user_id;
    this.event_id = event_id;
    this.role = role;
  }
  id = uuid.v4();
  user_id;
  event_id;
  role;
  left_event_at = null;
}

exports.getAllUsersEvents = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    //Return all user_event that are not deleted
    connection.query('SELECT * FROM users_events WHERE left_event_at IS null', (err, result) => {
      connection.release();
      if (err) throw err;
      res.send(result);
    });
  });
};

exports.getAllUsersForEvent = (req, res) => {
  if (uuid.validate(req.params.event_id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT users.firstname, users.lastname, users.emailaddress, users_events.role FROM users_events INNER JOIN users ON users_events.user_id = users.id WHERE users_events.event_id = ? AND users_events.left_event_at IS null', [req.params.event_id], (err, result) => {
        connection.release();
        if (err) throw err;
        res.send(result);
      });
    });
  } else {
    res.status(400).send({ 'error': req.params.event_id + ' is not a valid id' });
  }
}