var User = require('../models/User');
var jwt = require('jwt-simple');

var users = {

  getAll: function(req, res) {
    User.findAll(function(users) {
      var userMap = [];
      users.forEach(function(user) {
        userMap.push(User.userWithoutPassword(user));
      });
      res.status(200);
      res.json(userMap);
    }, function(error) {
      res.status(500);
      res.json({
        status: 500,
        message: "Error occured: " + error
      });
    });
  },

  getOne: function(req, res) {
    var id = req.params.id;
    User.findById(id, function(user) {
      res.status(200);
      res.json(User.userWithoutPassword(user));
    }, function(error) {
      res.status(500);
      res.json({
        status: 500,
        message: "Error occured: " + error
      });
    });
  },

  create: function(req, res) {
    User.findByEMail(req.body.email, function(user) {
      if (user) {
        res.status(409);
        res.json({
          status: 409,
          message: "User already exists"
        });
      } else {
        User.addUser({
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
  },

  update: function(req, res) {
    var id = req.params.id;
    User.updateUser(id, {
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
  },

  delete: function(req, res) {
    var id = req.params.id;
    User.removeUser({
      id: id
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

module.exports = users;