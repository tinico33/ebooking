var assert = require('assert');
var request = require('supertest');
var jwt = require('jwt-simple');
var User = require('../models/User');
var md5 = require('md5');

process.env.MONGO_URL = 'mongodb://localhost:27017/booking_test';

describe('Test signup services', function () {
  var server;
  beforeEach(function (done) {
  	delete require.cache[require.resolve('../server')];
    server = require('../server');
    User.addUser( { 
      username: 'test', 
      password: 'firstpassword', 
      firstname: 'Nicolas', 
      lastname: 'Ploquin', 
      email: 'ploquin.nicolas@gmail.com', 
      role: 'user'
    }, function(user) {
      done();
    });
  });
  afterEach(function(done) {
    User.model.remove({}, function() {
      server.close(done);
    });
  });
  it('should have 500 on /signup if username is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ username: '', password: 'notEmpty', firstname: 'notEmpty', lastname: 'notEmpty', role: 'notEmpty', email: 'notEmpty'})
   	.end(function(err, res){
  	  assert.equal(res.status, 500);
  	  assert.ok(res.body.message.includes('Error occured: ValidationError:'));
  	  done();
  	});
  });
  it('should have 500 on /signup if password is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'notEmpty', password: '', firstname: 'notEmpty', lastname: 'notEmpty', role: 'notEmpty', email: 'notEmpty'})
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.equal(res.body.message, 'Error occured: Password should not be empty');
      done();
    });
  });
  it('should have 500 on /signup if firstname is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'notEmpty', password: 'notEmpty', firstname: '', lastname: 'notEmpty', role: 'notEmpty', email: 'notEmpty'})
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.ok(res.body.message.includes('Error occured: ValidationError:'));
      done();
    });
  });
  it('should have 500 on /signup if lastname is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'notEmpty', password: 'notEmpty', firstname: 'notEmpty', lastname: '', role: 'notEmpty', email: 'notEmpty'})
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.ok(res.body.message.includes('Error occured: ValidationError:'));
      done();
    });
  });
  it('should have 500 on /signup if role is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'notEmpty', password: 'notEmpty', firstname: 'notEmpty', lastname: 'notEmpty', role: '', email: 'notEmpty'})
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.ok(res.body.message.includes('Error occured: ValidationError:'));
      done();
    });
  });
  it('should have 500 on /signup if email is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'notEmpty', password: 'notEmpty', firstname: 'notEmpty', lastname: 'notEmpty', role: 'notEmpty', email: ''})
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.ok(res.body.message.includes('Error occured: ValidationError:'));
      done();
    });
  });
  it('should create user when call /signup', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'testCreate', password: 'firstpasswordCreate', firstname: 'NicolasCreate', lastname: 'PloquinCreate', role: 'userCreate', email: 'ploquin.nicolas@gmail.com'})
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.equal(res.body.user.username, 'testCreate');
      assert.equal(res.body.user.firstname, 'NicolasCreate');
      assert.equal(res.body.user.lastname, 'PloquinCreate');
      assert.equal(res.body.user.role, 'userCreate');
      assert.equal(res.body.user.password, undefined);
      assert.equal(res.body.user.email, 'ploquin.nicolas@gmail.com');
      assert.notEqual(res.body.token, '');
      User.model.findOne({username: 'testCreate'}, function(err, user) {
        assert.equal(err, undefined);
        assert.notEqual(user, undefined);
        assert.equal(user.username, 'testCreate');
        assert.equal(user.firstname, 'NicolasCreate');
        assert.equal(user.lastname, 'PloquinCreate');
        assert.equal(user.password, md5('firstpasswordCreate'));
        assert.equal(user.email, 'ploquin.nicolas@gmail.com');
        assert.equal(user.role, 'userCreate');
        done();
      });
    });
  });
  it('should have 409 on /signup if user already exists', function(done) {
    request(server)
    .post('/signup')
    .send({ username: 'test', password: 'dfgghdghdghdgh', firstname: 'prénom', lastname: 'nom de famille', role: 'user', email: 'ploquin.nicolas@gmail.com'})
    .end(function(err, res){
      assert.equal(res.status, 409);
      assert.equal(res.body.message, 'User already exists');
      User.model.findOne({username: 'test'}, function(err, user) {
        assert.equal(err, undefined);
        assert.notEqual(user, undefined);
        assert.equal(user.username, 'test');
        assert.equal(user.firstname, 'Nicolas');
        assert.equal(user.lastname, 'Ploquin');
        assert.equal(user.password, md5('firstpassword'));
        assert.equal(user.email, 'ploquin.nicolas@gmail.com');
        assert.equal(user.role, 'user');
        done();
      });
    });
  });
});
