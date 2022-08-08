const uuid = require('uuid');
const database = require('../../database.js');
const pool = database.pool;

class Event {
  id = uuid.v4();
  name;
  startDate;
  endDate;
  location;
  description;
  deleted_at = null;
  created_at = new Date();
}