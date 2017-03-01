var jwt = require('jwt-simple');
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
    }
 
    if (dbUserObj) {
 
      // If authentication is success, we will generate a token
      // and dispatch it to the client
 
      res.json(genToken(dbUserObj));
    }
 
  },

  signup: function(req, res) {
    var username = req.body.username || '';
    var password = req.body.password || '';
    var firstname = req.body.firstname || '';
    var lastname = req.body.lastname || '';
 
    if (username == '' || password == '' || firstname == '' || lastname == '') {
      res.status(400);
      res.json({
        status: 400,
        message: "Missing firstname, lastname, username or password"
      });
      return;
    }

    User.findOne({username: username}, function(err, user) {
      if (err) {
        res.status(500);
        res.json({
          status: 500,
          message: "Error occured: " + err
        });
      } else {
        if (user) {
          res.status(409);
          res.json({
            status: 409,
            message: "User already exists"
          });
        } else {
          var userModel = new User();
          userModel.username = username;
          userModel.password = password;
          userModel.firstname = firstname;
          userModel.lastname = lastname;
          userModel.save(function(err, user) {
            user.token = jwt.encode(user, require('../config/secret')());
            user.save(function(err, user1) {
              res.status(200);
              res.json({
                status: 200,
                username: user1.username,
                firstname: user1.firstname,
                lastname: user1.lastname,
                token: user1.token
              });
            });
          })
        }
      }
    });
  },
 
  validate: function(username, password) {
    // spoofing the DB response for simplicity
    var dbUserObj = { // spoofing a userobject from the DB. 
      name: 'arvind',
      role: 'admin',
      username: 'arvind@myapp.com'
    };
 
    return dbUserObj;
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
  var token = jwt.encode({
    exp: expires,
    user: user
  }, require('../config/secret')());
 
  return {
    token: token,
    expires: expires,
    user: user
  };
}
 
function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}
 
module.exports = auth;