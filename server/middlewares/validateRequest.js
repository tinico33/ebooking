var jwt = require('jwt-simple');
var User = require('../models/User');
 
module.exports = function(req, res, next) {
 
  // When performing a cross domain request, you will recieve
  // a preflighted request first. This is to check if our the app
  // is safe. 
 
  // We skip the token outh for [OPTIONS] requests.
  //if(req.method == 'OPTIONS') next();
 
  var token = req.headers['authorization'];

  if (token) {
    try {
      var decoded = jwt.decode(token, require('../config/secret')());

      if (decoded.exp <= Date.now()) {
        res.status(400);
        res.json({
          "status": 400,
          "message": "Token Expired"
        });
        return;
      }
 
      // Authorize the user to see if s/he can access our resources
      // var dbUser = validateUser(decoded.user.email);
      User.findByEMail(decoded.user.email, function(user) {
        if (user) {
          if ((req.url.indexOf('admin') >= 0 && user.role == 'admin') || (req.url.indexOf('admin') < 0 && req.url.indexOf('/api/v1/') >= 0)) {
            next(); // To move to next middleware
          } else {
            res.status(403);
            res.json({
              "status": 403,
              "message": "Not Authorized"
            });
            return;
          }
        } else {
          // No user with this email exists, respond back with a 401
          res.status(401);
          res.json({
            "status": 401,
            "message": "Invalid User"
          });
          return;
        }
      }, function(error) {
        res.status(500);
        res.json({
          status: 500,
          message: "Error occured: " + error
        });
      });
    } catch (error) {
      res.status(500);
      res.json({
        status: 500,
        message: "Error occured: " + error
      });
    }
  } else {
    res.status(401);
    res.json({
      "status": 401,
      "message": "Invalid Token or Key"
    });
    return;
  }
};