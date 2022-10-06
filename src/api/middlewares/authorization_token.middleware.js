const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyAuthorizationToken = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader && authorizationHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
    if (err) return res.sendStatus(403);
    req.user = result;
    next();
  });
};
