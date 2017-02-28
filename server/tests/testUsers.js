var assert = require('assert');
var request = require('supertest');
var jwt = require('jwt-simple');

describe('Test errors', function () {
  var server;
  beforeEach(function () {
  	delete require.cache[require.resolve('../server')];
    server = require('../server');
  });
  afterEach(function(done) {
    server.close(done);
  });
  it('404 on /', function(done) {
  	request(server)
    .get('/')
	.end(function(err, res){
	  assert.equal(res.status, 404);
	  done();
	});
  });
  it('401 on /login if username is empty', function(done) {
    request(server)
    .post('/login')
    .send({ username: '', password: 'notEmpty'})
   	.end(function(err, res){
	  assert.equal(res.status, 401);
	  assert.equal(res.body.message, 'Invalid credentials');
	  done();
	});
  });
  it('401 on /login if password is empty', function(done) {
    request(server)
    .post('/login')
    .send({ username: 'notEmpty', password: ''})
   	.end(function(err, res){
	  assert.equal(res.status, 401);
	  assert.equal(res.body.message, 'Invalid credentials');
	  done();
	});
  });
  it('401 on /login if username and password are empty', function(done) {
    request(server)
    .post('/login')
    .send({ username: '', password: ''})
	.expect(401, {
        status: 401,
        message: 'Invalid credentials'
    }, done);
  });
  it('401 on /api/v1/test if no token in request', function(done) {
    request(server)
    .post('/api/v1/test')
   	.end(function(err, res){
	  assert.equal(res.status, 401);
	  assert.equal(res.body.message, 'Invalid Token or Key');
	  done();
	});
  });
  it('400 on /api/v1/test if token is expired', function(done) {
    request(server)
    .post('/api/v1/test')
    .set('authorization', genToken({name: 'Ploquin', role: 'admin', username: 'nploquin'}, -1))
   	.end(function(err, res){
	  assert.equal(res.status, 400);
	  assert.equal(res.body.message, 'Token Expired');
	  done();
	});
  });
  it('401 on /api/v1/test if user in token is invalid', function(done) {
    request(server)
    .post('/api/v1/test')
    .set('authorization', genToken({name: 'Ploquin', role: 'admin', username: 'unknown'}, 1))
	.expect(401, {
        status: 401,
        message: 'Invalid User'
    }, done);
  });
  it('403 on /api/v1/admin/test if user in token is not admin', function(done) {
    request(server)
    .post('/api/v1/admin/test')
    .set('authorization', genToken({name: 'Ploquin', role: 'user', username: 'simpleUser'}, 1))
	.expect(403, {
        status: 403,
        message: 'Not Authorized'
    }, done);
  });
});

function genToken(user, expiration) {
	var dateObj = new Date();
	var expires = dateObj.setDate(dateObj.getDate() + expiration);
	var token = jwt.encode({
		exp: expires,
		user: user
	}, require('../config/secret')());
	return token;
 }