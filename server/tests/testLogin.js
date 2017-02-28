var assert = require('assert');
var request = require('supertest');
var jwt = require('jwt-simple');

describe('Test login', function () {
  var server;
  beforeEach(function () {
  	delete require.cache[require.resolve('../server')];
    server = require('../server');
  });
  afterEach(function(done) {
    server.close(done);
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