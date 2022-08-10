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