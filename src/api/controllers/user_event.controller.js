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