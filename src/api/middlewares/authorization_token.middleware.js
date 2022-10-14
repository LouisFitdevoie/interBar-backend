const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyAuthorizationToken = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  console.log(`authorizationHeader: ${authorizationHeader}`);
  const token = authorizationHeader && authorizationHeader.split(" ")[1];
  if (token == null) {
    console.log("Authorization token missing");
    return res.sendStatus(401, "Authorization token missing");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, result) => {
    if (err) return res.sendStatus(403, "Token is not valid");
    req.user = result;
    next();
  });
};
