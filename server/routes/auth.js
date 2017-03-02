var jwt = require('jwt-simple');
var md5 = require('md5');
var User = require('../models/User');
 
var auth = {
 
  login: function(req, res) {

    var username = req.body.username || '';
    var password = req.body.password || '';
 
    if (username == '' || password == '') {
      res.status(401);
      res.json({
        status: 401,
        message: "Invalid credentials"
      });
      return;
    }

    // Fire a query to your DB and check if the credentials are valid
    var dbUserObj = auth.validate(username, password);
   
    if (!dbUserObj) { // If authentication fails, we send a 401 back
      res.status(401);
      res.json({
        status: 401,
        message: "Invalid credentials"
      });
      return;
    } else { 
      // If authentication is success, we will generate a token
      // and dispatch it to the client
      res.status(200);
      res.json(genToken(dbUserObj));
    }
 
  },

  signup: function(req, res) {
    User.findByUsername(req.body.username, function(user) {
      if (user) {
        res.status(409);
        res.json({
          status: 409,
          message: "User already exists"
        });
      } else {
        User.addUser( {
          username: req.body.username,
          password: req.body.password,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
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
  },
 
  validate: function(username, password) {
    User.findByUsernameAndPassword(username, password, function(user) {
      if (user) {
        return user;
      } else {
        return;
      }
    }, function(error) {
      return;
    });
  },
 
  validateUser: function(username) {
    // spoofing the DB response for simplicity
    if(username == 'adminUser') {
      return { // spoofing a userobject from the DB. 
        name: 'arvind',
        role: 'admin',
        username: 'arvind@myapp.com'
      };
    } else if(username == 'simpleUser') {
      return { // spoofing a userobject from the DB. 
        name: 'arvind',
        role: 'user',
        username: 'arvind@myapp.com'
      };
    } else {
      return undefined;
    } 
  },
}
 
// private method
function genToken(user) {
  var expires = expiresIn(7); // 7 days
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
 
function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}
 
module.exports = auth;