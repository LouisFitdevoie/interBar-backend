const uuid = require('uuid');
const database = require('../../database.js');

const pool = database.pool;

class EventProduct {
  constructor(event_id, product_id, stock, buyingPrice, sellingPrice) {
    this.event_id = event_id;
    this.product_id = product_id;
    this.stock = stock;
    this.buyingPrice = buyingPrice;
    this.sellingPrice = sellingPrice;
  }
  id = uuid.v4();
  event_id;
  product_id;
  stock;
  buyingPrice;
  sellingPrice;
  deleted_at = null;
}

exports.getAllEventProducts = (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    connection.query('SELECT * FROM events_products WHERE deleted_at IS null', (err, result) => {
      connection.release();
      if (err) throw err;
      res.send(result);
    });
  })
}

exports.getAllEventProductsByEventId = (req, res) => {
  if (uuid.validate(req.query.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT * FROM events WHERE id = ? AND deleted_at IS null', [req.query.id], (err, result) => {
        if (result.length > 0) {
          connection.query('SELECT * FROM events_products WHERE event_id = ? AND deleted_at IS null', [req.query.id], (err, result) => {
            connection.release();
            if (err) throw err;
            res.send(result);
          });
        } else {
          connection.release();
          res.status(404).send({ 'error': 'No event was found with the id ' + req.query.id });
        }
      });
      
    })
  } else {
    res.status(400).send({ 'error': req.query.id + 'is not a valid id' });
  }
}