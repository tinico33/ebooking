var jwt = require('jwt-simple');
var User = require('../models/User');
var md5 = require('md5');

process.env.MONGO_URL = 'mongodb://localhost:27017/booking_test';

var _server;

var _genToken = function(user, expiration) {
  var dateObj = new Date();
  var expires = dateObj.setDate(dateObj.getDate() + expiration);
  var userWithoutPassword = User.userWithoutPassword(user);
  var token = jwt.encode({
    exp: expires,
    user: userWithoutPassword
  }, require('../config/secret')());
  return {
    token: token,
    user: userWithoutPassword
  };
};

var _decodeToken = function(token) {
  return jwt.decode(token.token, require('../config/secret')());
};

var _newServer = function() {
  delete require.cache[require.resolve('../server')];
  _server = require('../server');
  return _server;
};

var _removeAllUsers = function(done) {
  User.model.remove({}, function() {
    _server.close(done);
  });
}

module.exports = {
  genToken: _genToken,
  decodeToken: _decodeToken,
  newServer: _newServer,
  removeAllUsers: _removeAllUsers,
}