var assert = require('assert');
var request = require('supertest');
var User = require('../models/User');
var tools = require('./testTools');

process.env.MONGO_URL = 'mongodb://localhost:27017/booking_test';

var userId;

describe('Test /api/v1/* services', function () {
  var server;
  beforeEach(function (done) {
    server = tools.newServer();
    User.addUser( { 
      email: 'ploquin.nicolas@gmail.com', 
      password: 'firstpassword', 
      firstname: 'Nicolas', 
      lastname: 'Ploquin', 
      role: 'user'
    }, function(user) {
      userId = user.id;
      done();
    });
  });
  afterEach(function(done) {
    tools.removeAllUsers(done);
  });
  it('should have 401 on /api/v1/test if no token in request', function(done) {
    request(server)
    .post('/api/v1/test')
   	.end(function(err, res){
  	  assert.equal(res.status, 401);
      assert.equal(res.body.status, 401);
  	  assert.equal(res.body.message, 'Invalid Token or Key');
  	  done();
  	});
  });
  it('should have 400 on /api/v1/test if token is expired', function(done) {
    request(server)
    .post('/api/v1/test')
    .set('authorization', tools.genToken({ _id: userId}, -1).token)
   	.end(function(err, res){
  	  assert.equal(res.status, 400);
      assert.equal(res.body.status, 400);
  	  assert.equal(res.body.message, 'Token Expired');
  	  done();
  	});
  });
  it('should have 401 on /api/v1/test if user in token is invalid', function(done) {
    request(server)
    .post('/api/v1/test')
    .set('authorization', tools.genToken({ id: '000000000000'}, 1).token)
    .expect(401, {
      status: 401,
      message: 'Invalid User'
    }, done);
  });
  it('should have 403 on /api/v1/admin/test if user in token is not admin', function(done) {
    request(server)
    .post('/api/v1/admin/test')
    .set('authorization', tools.genToken({ _id: userId}, 1).token)
	  .expect(403, {
      status: 403,
      message: 'Not Authorized'
    }, done);
  });
  it('should have 500 on /api/v1/test if token is not valid', function(done) {
    request(server)
    .post('/api/v1/test')
    .set('authorization', 'notValidToken')
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.equal(res.body.status, 500);
      assert.ok(res.body.message.includes('Error occured: '));
      done();
    });
  });
});
