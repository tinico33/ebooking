var jwt = require('jwt-simple');
var md5 = require('md5');
var User = require('../models/User');
 
var auth = {
 
  login: function(req, res) {
    var email = req.body.email || '';
    var password = req.body.password || '';

    // Fire a query to your DB and check if the credentials are valid
    User.findByEMailAndPassword(email, password, function(user) {
      if (user) {
        // If authentication is success, we will generate a token
        // and dispatch it to the client
        res.status(200);
        res.json(genToken(user));
      } else {  // If authentication fails, we send a 401 back
        res.status(401);
        res.json({
          status: 401,
          message: "Invalid credentials"
        });
      }
    }, function(error) {
      res.status(500);
      res.json({
        status: 500,
        message: "Error occured: " + error
      });
    });
  },

  signup: function(req, res) {
    User.findByEMail(req.body.email, function(user) {
      if (user) {
        res.status(409);
        res.json({
          status: 409,
          message: "User already exists"
        });
      } else {
        User.addUser( {
          email: req.body.email,
          password: req.body.password,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          role: req.body.role
        }, function(user) {
          res.status(200);
          res.json(genToken(user));
        }, function(error) {
          res.status(500);
          res.json({
            status: 500,
            message: "Error occured: " + error
          });
        });
      }
    }, function(error) {
      res.status(500);
      res.json({
        status: 500,
        message: "Error occured: " + error
      });
    });
  }
}

function genToken(user) {
  var dateObj = new Date();
  var expires = dateObj.setDate(dateObj.getDate() + 7);
  var userWithoutPassword = User.userWithoutPassword(user);
  var token = jwt.encode({
    exp: expires,
    user: userWithoutPassword
  }, require('../config/secret')());
  return {
    token: token,
    user: userWithoutPassword
  };
 }
 
module.exports = auth;