const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.verifyAuthorizationToken = (req, res, next) => {
  const nonSecurePath = ["/login", "/create-user", "/update-token", "/logout"];
  if (nonSecurePath.includes(req.path)) return next();
  const authorizationHeader = req.headers["authorization"];
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
