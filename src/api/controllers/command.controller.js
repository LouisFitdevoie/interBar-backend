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