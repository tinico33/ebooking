var assert = require('assert');
var request = require('supertest');
var jwt = require('jwt-simple');
var User = require('../models/User');

var utilisateur = { 
      email: 'ploquin.nicolas@gmail.com', 
      password: 'goodPassword', 
      firstname: 'Nicolas', 
      lastname: 'Ploquin', 
      role: 'user'
    };

describe('Test /signin', function () {
  var server;
  beforeEach(function (done) {
    delete require.cache[require.resolve('../server')];
    server = require('../server');
    User.addUser( utilisateur, function(user) {
      done();
    });
  });
  afterEach(function(done) {
    User.model.remove({}, function() {
      server.close(done);
    });
  });
  it('should have 401 on /signin if email is empty', function(done) {
    request(server)
    .post('/signin')
    .send({ email: '', password: 'notEmpty'})
   	.end(function(err, res){
  	  assert.equal(res.status, 401);
  	  assert.equal(res.body.message, 'Invalid credentials');
  	  done();
  	});
  });
  it('should have 401 on /signin if password is empty', function(done) {
    request(server)
    .post('/signin')
    .send({ email: 'notEmpty', password: ''})
   	.end(function(err, res){
  	  assert.equal(res.status, 401);
  	  assert.equal(res.body.message, 'Invalid credentials');
  	  done();
  	});
  });
  it('should have 401 on /signin if email and password are empty', function(done) {
    request(server)
    .post('/signin')
    .send({ email: '', password: ''})
  	.expect(401, {
      status: 401,
      message: 'Invalid credentials'
    }, done);
  });
  it('should have 401 on /signin with bad email and good password', function(done) {
    request(server)
    .post('/signin')
    .send({ email: 'other@gmail.com', password: 'goodPassword'})
    .expect(401, {
      status: 401,
      message: 'Invalid credentials'
    }, done);
  });
  it('should have 401 on /signin with good email and bad password', function(done) {
    request(server)
    .post('/signin')
    .send({ email: 'ploquin.nicolas@gmail.com', password: 'badpassword'})
    .expect(401, {
      status: 401,
      message: 'Invalid credentials'
    }, done);
  });
  it('should have 401 on /signin with good email and good password (but bad casse on the P)', function(done) {
    request(server)
    .post('/signin')
    .send({ email: 'ploquin.nicolas@gmail.com', password: 'goodpassword'})
    .expect(401, {
      status: 401,
      message: 'Invalid credentials'
    }, done);
  });
  it('should have 200 on /signin with good email and good password', function(done) {
    request(server)
    .post('/signin')
    .send({ email: 'ploquin.nicolas@gmail.com', password: 'goodPassword'})
    .end(function(err, res){
      assert.equal(res.status, 200);
      var token = genToken(utilisateur);
      assert.notEqual(res.body.user.id, '');
      assert.equal(res.body.user.email, token.user.email);
      assert.equal(res.body.user.firstname, token.user.firstname);
      assert.equal(res.body.user.lastname, token.user.lastname);
      assert.equal(res.body.user.role, token.user.role);

      var decoded = jwt.decode(token.token, require('../config/secret')());
      assert.equal(decoded.user.email, token.user.email);
      assert.equal(decoded.user.firstname, token.user.firstname);
      assert.equal(decoded.user.lastname, token.user.lastname);
      assert.equal(decoded.user.role, token.user.role);

      done();
    });
  });
});

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