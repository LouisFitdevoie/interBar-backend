const uuid = require('uuid');

class Product {
  constructor(name, category, description) {
    this.name = name;
    this.category = category;
    this.description = description;
  }
  id = uuid.v4();
  name;
  category;
  description;
  deleted_at = null;
}

exports.getAllProducts = (req, res) => {
  let products = productsTable.filter(p => p.deleted_at === null);
  res.send(products);
}

exports.getProductById = (req, res, con) => {
  let product = productsTable.find(p => p.id === parseInt(req.query.id) && p.deleted_at === null);
  if (!product) {
    res.status(404).send({ 'error': 'Product not found for the id ' + req.query.id });
  } else {
    res.send(product);
  }
}

exports.getProductByName = (req, res) => {
  let product = productsTable.find(p => p.name.toLowerCase().startsWith(req.query.name.toLowerCase()) && p.deleted_at === null);
  if (!product) {
    res.status(404).send({ 'error': 'Product not found for the name ' + req.query.name });
  } else {
    res.send(product);
  }
}

exports.getProductByCategory = (req, res) => {
  let product = productsTable.filter(p => p.category === parseInt(req.query.category) && p.deleted_at === null);
  if (!product) {
    res.status(404).send({ 'error': 'Product not found for the category ' + req.query.category });
  } else {
    res.send(product);
  }
}
