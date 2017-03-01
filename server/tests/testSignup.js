var assert = require('assert');
var request = require('supertest');
var jwt = require('jwt-simple');

describe('Test signup services', function () {
  var server;
  beforeEach(function () {
  	delete require.cache[require.resolve('../server')];
    server = require('../server');
  });
  afterEach(function(done) {
    server.close(done);
  });
  it('should have 400 on /signup if username is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ username: '', password: 'notEmpty', firstname: 'notEmpty', lastname: 'notEmpty'})
   	.end(function(err, res){
  	  assert.equal(res.status, 400);
  	  assert.equal(res.body.message, 'Missing firstname, lastname, username or password');
  	  done();
  	});
  });
  it('should have 400 on /signup if password is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'notEmpty', password: '', firstname: 'notEmpty', lastname: 'notEmpty'})
    .end(function(err, res){
      assert.equal(res.status, 400);
      assert.equal(res.body.message, 'Missing firstname, lastname, username or password');
      done();
    });
  });
  it('should have 400 on /signup if firstname is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'notEmpty', password: 'notEmpty', firstname: '', lastname: 'notEmpty'})
    .end(function(err, res){
      assert.equal(res.status, 400);
      assert.equal(res.body.message, 'Missing firstname, lastname, username or password');
      done();
    });
  });
  it('should have 400 on /signup if lastname is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'notEmpty', password: 'notEmpty', firstname: 'notEmpty', lastname: ''})
    .end(function(err, res){
      assert.equal(res.status, 400);
      assert.equal(res.body.message, 'Missing firstname, lastname, username or password');
      done();
    });
  });
  it('should create user when call /signup', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'test', password: 'firstpassword', firstname: 'Nicolas', lastname: 'Ploquin'})
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.equal(res.body.username, 'test');
      assert.equal(res.body.firstname, 'Nicolas');
      assert.equal(res.body.lastname, 'Ploquin');
      assert.notEqual(res.body.token, '');
      done();
    });
  });
  it('should have 409 on /signup if user already exists', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'test', password: 'dfgghdghdghdgh', firstname: 'prénom', lastname: 'nom de famille'})
    .end(function(err, res){
      assert.equal(res.status, 409);
      assert.equal(res.body.message, 'User already exists');
      done();
    });
  });
});
