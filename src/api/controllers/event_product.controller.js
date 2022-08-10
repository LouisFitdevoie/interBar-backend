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
        if (err) throw err;
        if (result.length > 0) {
          connection.query('SELECT * FROM events_products INNER JOIN products ON events_products.product_id = products.id WHERE events_products.event_id = ? AND events_products.deleted_at IS null ORDER BY products.name', [req.query.id], (err, result) => {
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

exports.getProductEventStock = (req, res) => {
  if (uuid.validate(req.query.event_id)) {
    if (uuid.validate(req.query.product_id)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT * FROM events WHERE id = ? AND deleted_at IS null', [req.query.event_id], (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            connection.query('SELECT * FROM products WHERE id = ? AND deleted_at IS null', [req.query.product_id], (err, result) => {
              if (err) throw err;
              if (result.length > 0) {
                connection.query('SELECT events_products.stock, products.name FROM events_products INNER JOIN products ON events_products.product_id=products.id WHERE (events_products.event_id = ? AND events_products.product_id = ? AND events_products.deleted_at IS null)', [req.query.event_id, req.query.product_id], (err, result) => {
                  connection.release();
                  if (err) throw err;
                  res.send(result);
                });
              } else {
                connection.release();
                res.status(404).send({ 'error': 'No product was found with the id ' + req.query.product_id });
              }
            });
          } else {
            res.status(404).send({ 'error': 'No event was found with the id ' + req.query.event_id });
          }
        });
      });
    } else {
      res.status(400).send({ 'error': 'The id specified for the product is not a valid id'});
    }
  } else {
    res.status(400).send({ 'error': 'The id specified for the event is not a valid id'});
  }
}

exports.getProductEventBuyingPrice = (req, res) => {
  if (uuid.validate(req.query.event_id)) {
    if (uuid.validate(req.query.product_id)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT * FROM events WHERE id = ? AND deleted_at IS null', [req.query.event_id], (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            connection.query('SELECT * FROM products WHERE id = ? AND deleted_at IS null', [req.query.product_id], (err, result) => {
              if (err) throw err;
              if (result.length > 0) {
                connection.query('SELECT events_products.buyingPrice, products.name FROM events_products INNER JOIN products ON events_products.product_id=products.id WHERE (events_products.event_id = ? AND events_products.product_id = ? AND events_products.deleted_at IS null)', [req.query.event_id, req.query.product_id], (err, result) => {
                  connection.release();
                  if (err) throw err;
                  res.send(result);
                });
              } else {
                connection.release();
                res.status(404).send({ 'error': 'No product was found with the id ' + req.query.product_id });
              }
            });
          } else {
            res.status(404).send({ 'error': 'No event was found with the id ' + req.query.event_id });
          }
        });
      });
    } else {
      res.status(400).send({ 'error': 'The id specified for the product is not a valid id'});
    }
  } else {
    res.status(400).send({ 'error': 'The id specified for the event is not a valid id'});
  }
}

exports.getProductEventSellingPrice = (req, res) => {
  if (uuid.validate(req.query.event_id)) {
    if (uuid.validate(req.query.product_id)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT * FROM events WHERE id = ? AND deleted_at IS null', [req.query.event_id], (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            connection.query('SELECT * FROM products WHERE id = ? AND deleted_at IS null', [req.query.product_id], (err, result) => {
              if (err) throw err;
              if (result.length > 0) {
                connection.query('SELECT events_products.sellingPrice, products.name FROM events_products INNER JOIN products ON events_products.product_id=products.id WHERE (events_products.event_id = ? AND events_products.product_id = ? AND events_products.deleted_at IS null)', [req.query.event_id, req.query.product_id], (err, result) => {
                  connection.release();
                  if (err) throw err;
                  res.send(result);
                });
              } else {
                connection.release();
                res.status(404).send({ 'error': 'No product was found with the id ' + req.query.product_id });
              }
            });
          } else {
            res.status(404).send({ 'error': 'No event was found with the id ' + req.query.event_id });
          }
        });
      });
    } else {
      res.status(400).send({ 'error': 'The id specified for the product is not a valid id'});
    }
  } else {
    res.status(400).send({ 'error': 'The id specified for the event is not a valid id'});
  }
}

exports.getProductEventInfos = (req, res) => {
  if (uuid.validate(req.query.event_id)) {
    if (uuid.validate(req.query.product_id)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT * FROM events WHERE id = ? AND deleted_at IS null', [req.query.event_id], (err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            connection.query('SELECT * FROM products WHERE id = ? AND deleted_at IS null', [req.query.product_id], (err, result) => {
              if (err) throw err;
              if (result.length > 0) {
                connection.query('SELECT * FROM events_products INNER JOIN products ON events_products.product_id=products.id WHERE (events_products.event_id = ? AND events_products.product_id = ? AND events_products.deleted_at IS null)', [req.query.event_id, req.query.product_id], (err, result) => {
                  connection.release();
                  if (err) throw err;
                  res.send(result);
                });
              } else {
                connection.release();
                res.status(404).send({ 'error': 'No product was found with the id ' + req.query.product_id });
              }
            });
          } else {
            res.status(404).send({ 'error': 'No event was found with the id ' + req.query.event_id });
          }
        });
      });
    } else {
      res.status(400).send({ 'error': 'The id specified for the product is not a valid id'});
    }
  } else {
    res.status(400).send({ 'error': 'The id specified for the event is not a valid id'});
  }
}