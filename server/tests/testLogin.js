var assert = require('assert');
var request = require('supertest');
var jwt = require('jwt-simple');

describe('Test /login', function () {
  var server;
  beforeEach(function () {
  	delete require.cache[require.resolve('../server')];
    server = require('../server');
  });
  afterEach(function(done) {
    server.close(done);
  });
  it('should have 401 on /login if email is empty', function(done) {
    request(server)
    .post('/login')
    .send({ email: '', password: 'notEmpty'})
   	.end(function(err, res){
  	  assert.equal(res.status, 401);
  	  assert.equal(res.body.message, 'Invalid credentials');
  	  done();
  	});
  });
  it('should have 401 on /login if password is empty', function(done) {
    request(server)
    .post('/login')
    .send({ email: 'notEmpty', password: ''})
   	.end(function(err, res){
  	  assert.equal(res.status, 401);
  	  assert.equal(res.body.message, 'Invalid credentials');
  	  done();
  	});
  });
  it('should have 401 on /login if email and password are empty', function(done) {
    request(server)
    .post('/login')
    .send({ email: '', password: ''})
  	.expect(401, {
      status: 401,
      message: 'Invalid credentials'
    }, done);
  });
});