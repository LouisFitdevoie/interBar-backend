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
          connection.query('SELECT events_products.id AS events_products_id, events_products.product_id, events_products.event_id, products.name, products.category, products.description, events_products.stock, events_products.buyingPrice, events_products.sellingPrice FROM events_products INNER JOIN products ON events_products.product_id = products.id WHERE events_products.event_id = ? AND events_products.deleted_at IS null ORDER BY products.name', [req.query.id], (err, result) => {
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
                connection.query('SELECT events_products.id AS events_products_id, events_products.product_id, events_products.event_id, products.name, products.category, products.description, events_products.stock, events_products.buyingPrice, events_products.sellingPrice FROM events_products INNER JOIN products ON events_products.product_id=products.id WHERE (events_products.event_id = ? AND events_products.product_id = ? AND events_products.deleted_at IS null)', [req.query.event_id, req.query.product_id], (err, result) => {
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

exports.createEventProduct = (req, res) => {
  if (uuid.validate(req.body.event_id)) {
    if (uuid.validate(req.body.product_id)) {
      if (parseInt(req.body.stock) > 0) {
        if (parseFloat(req.body.buyingPrice) >= 0.0) {
          if (parseFloat(req.body.sellingPrice) >= 0.0) {
            let eventProductToCreate = new EventProduct(req.body.event_id, req.body.product_id, req.body.stock, req.body.buyingPrice, req.body.sellingPrice);
            pool.getConnection((err, connection) => {
              if (err) throw err;
              connection.query('SELECT id FROM events WHERE id = ? AND deleted_at IS null', [eventProductToCreate.event_id], (err, result) => {
                if (err) throw err;
                if (result.length === 1) {
                  connection.query('SELECT id FROM products WHERE id = ? AND deleted_at IS null', [eventProductToCreate.product_id], (err, result) => {
                    if (err) throw err;
                    if (result.length === 1) {
                      connection.query('SELECT id FROM events_products WHERE event_id = ? AND product_id = ? AND deleted_at IS null', [eventProductToCreate.event_id, eventProductToCreate.product_id], (err, result) => {
                        if (err) throw err;
                        if (result.length === 0) {
                          connection.query('INSERT INTO events_products (id, event_id, product_id, stock, buyingPrice, sellingPrice, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [eventProductToCreate.id, eventProductToCreate.event_id, eventProductToCreate.product_id, eventProductToCreate.stock, eventProductToCreate.buyingPrice, eventProductToCreate.sellingPrice, eventProductToCreate.deleted_at], (err, result) => {
                            connection.release();
                            if (err) throw err;
                            res.send(result);
                          });
                        } else {
                          connection.release();
                          res.status(409).send({ 'error': 'The product is already in the event'});
                        }
                      });
                    } else {
                      connection.release();
                      res.status(404).send({ 'error': 'No product was found with the id ' + eventProductToCreate.product_id });
                    }
                  });
                } else {
                  connection.release();
                  res.status(404).send({ 'error': 'No event was found with the id ' + eventProductToCreate.event_id });
                }
              });
            });
          } else {
            res.status(400).send({ 'error': 'The selling price must be a positive number'});
          }
        } else {
          res.status(400).send({ 'error': 'The buying price must be a positive number'});
        }
      } else {
        res.status(400).send({ 'error': 'The stock must be a positive number'});
      }
    } else {
      res.status(400).send({ 'error': 'The id specified for the product is not a valid id'});
    }
  } else {
    res.status(400).send({ 'error': 'The id specified for the event is not a valid id'});
  }
}

exports.deleteEventProduct = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT id FROM events_products WHERE id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
        if (err) throw err;
        if (result.length === 1) {
          connection.query('UPDATE events_products SET deleted_at = NOW() WHERE id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
            connection.release();
            if (err) throw err;
            res.send(result);
        });
        } else {
          connection.release();
          res.status(404).send({ 'error': 'No event product was found with the id ' + req.params.id });
        }
      });
    });
  } else {
    res.status(400).send({ 'error': 'The id specified is not a valid id'});
  }
}

exports.editEventProduct = (req, res) => {
  if (uuid.validate(req.params.id)) {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query('SELECT stock, buyingPrice, sellingPrice FROM events_products WHERE id = ? AND deleted_at IS null', [req.params.id], (err, result) => {
        if (err) throw err;
        if (result.length === 1) {
          let dataToEdit = [
            (parseInt(req.body.stock) != parseInt(result[0].stock)) ? true : false, 
            (parseFloat(req.body.buyingPrice) != parseFloat(result[0].buyingPrice)) ? true : false, 
            (parseFloat(req.body.sellingPrice) != parseFloat(result[0].sellingPrice)) ? true : false
          ];
          if (dataToEdit[0]) {
            if (parseInt(req.body.stock) <= 0) {
              connection.release();
              res.status(400).send({ 'error': 'The stock must be a positive number'});
            }
          }
          if (dataToEdit[1]) {
            if (parseFloat(req.body.buyingPrice) < 0.0) {
              connection.release();
              res.status(400).send({ 'error': 'The buying price must be a positive number'});
            }
          }
          if (dataToEdit[2]) {
            if (parseFloat(req.body.sellingPrice) < 0.0) {
              connection.release();
              res.status(400).send({ 'error': 'The selling price must be a positive number'});
            }
          }
          if (dataToEdit.includes(true)) {
            let sql = 'UPDATE events_products SET ';
            let arrayOfEdition = [];
            if (dataToEdit[0]) {
              arrayOfEdition.push(parseInt(req.body.stock));
              if (dataToEdit[1] || dataToEdit[2]) {
                sql += 'stock = ?, ';
              } else {
                sql += 'stock = ? ';
              }
            }
            if (dataToEdit[1]) {
              arrayOfEdition.push(parseFloat(req.body.buyingPrice));
              if (dataToEdit[2]) {
                sql += 'buyingPrice = ?, ';
              } else {
                sql += 'buyingPrice = ? ';
              }
            }
            if (dataToEdit[2]) {
              arrayOfEdition.push(parseFloat(req.body.sellingPrice));
              sql += 'sellingPrice = ? ';
            }
            sql += 'WHERE id = ? AND deleted_at IS null';
            arrayOfEdition.push(req.params.id);
            connection.query(sql, arrayOfEdition, (err, result) => {
              connection.release();
              if (err) throw err;
              res.send(result);
            });
          } else {
            connection.release();
            res.status(400).send({ 'error': 'No data to edit'});
          }
        } else {
          connection.release();
          res.status(404).send({ 'error': 'No event product was found with the id ' + req.params.id });
        }
      });
    });
  } else {
    res.status(400).send({ 'error': 'The id specified is not a valid id'});
  }
}
exports.sellProduct = (req, res) => {
  if (uuid.validate(req.query.eventId)) {
    if (uuid.validate(req.query.productId)) {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT id FROM events WHERE id = ? AND deleted_at IS null', [req.query.eventId], (err, result) => {
          if (err) throw err;
          if (result.length === 1) {
            connection.query('SELECT id FROM products WHERE id = ? AND deleted_at IS null', [req.query.productId], (err, result) => {
              if (err) throw err;
              if (result.length === 1) {
                connection.query('SELECT stock FROM events_products WHERE event_id = ? AND product_id = ? AND deleted_at IS null', [req.query.eventId, req.query.productId], (err, result) => {
                  if (err) throw err;
                  if (result.length === 1) {
                    if (result[0].stock - req.body.quantity >= 0) {
                      connection.query('UPDATE events_products SET stock = stock - ? WHERE event_id = ? AND product_id = ? AND deleted_at IS null', [req.body.quantity, req.query.eventId, req.query.productId], (err, result) => {
                        connection.release();
                        if (err) throw err;
                        res.send(result);
                      });
                    } else {
                      connection.release();
                      res.status(400).send({ 'error': 'The stock is not enough to sell ' + req.body.quantity + ' products'});
                    }
                  }
                })
              } else {
                connection.release();
                res.status(404).send({ 'error': 'No product was found with the id ' + req.query.productId });
              }
            });
          } else {
            connection.release();
            res.status(404).send({ 'error': 'No event was found with the id ' + req.query.eventId });
          }
        })
      })
    } else {
      res.status(400).send({ 'error': 'The id specified for the product is not a valid id'});
    }
  } else {
    res.status(400).send({ 'error': 'The id specified for the event is not a valid id'});
  }
}