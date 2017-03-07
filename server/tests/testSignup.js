var assert = require('assert');
var request = require('supertest');
var User = require('../models/User');
var md5 = require('md5');
var tools = require('./testTools');

describe('Test /signup services', function () {
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
      done();
    });
  });
  afterEach(function(done) {
    tools.removeAllUsers(done);
  });
  it('should have 500 on /signup if email is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ email: '', password: 'notEmpty', firstname: 'notEmpty', lastname: 'notEmpty', role: 'notEmpty'})
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.ok(res.body.message.includes('Error occured: ValidationError:'));
      done();
    });
  });
  it('should have 500 on /signup if password is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ email: 'othermail@gmail.com', password: '', firstname: 'notEmpty', lastname: 'notEmpty', role: 'notEmpty'})
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.equal(res.body.message, 'Error occured: Password should not be empty');
      done();
    });
  });
  it('should have 500 on /signup if firstname is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ email: 'othermail@gmail.com', password: 'notEmpty', firstname: '', lastname: 'notEmpty', role: 'notEmpty'})
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.ok(res.body.message.includes('Error occured: ValidationError:'));
      done();
    });
  });
  it('should have 500 on /signup if lastname is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ email: 'othermail@gmail.com', password: 'notEmpty', firstname: 'notEmpty', lastname: '', role: 'notEmpty'})
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.ok(res.body.message.includes('Error occured: ValidationError:'));
      done();
    });
  });
  it('should have 500 on /signup if role is empty', function(done) {
    request(server)
    .post('/signup')
    .send({ email: 'othermail@gmail.com', password: 'notEmpty', firstname: 'notEmpty', lastname: 'notEmpty', role: ''})
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.ok(res.body.message.includes('Error occured: ValidationError:'));
      done();
    });
  });
  it('should create user when call /signup', function(done) {
    request(server)
    .post('/signup')
    .send({password: 'firstpasswordCreate', firstname: 'NicolasCreate', lastname: 'PloquinCreate', role: 'userCreate', email: 'othermail@gmail.com'})
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.notEqual(res.body.user.id, '');
      assert.equal(res.body.user.firstname, 'NicolasCreate');
      assert.equal(res.body.user.lastname, 'PloquinCreate');
      assert.equal(res.body.user.role, 'userCreate');
      assert.equal(res.body.user.password, undefined);
      assert.equal(res.body.user.email, 'othermail@gmail.com');
      assert.notEqual(res.body.token, '');
      User.model.findOne({email: 'othermail@gmail.com'}, function(err, user) {
        assert.equal(err, undefined);
        assert.notEqual(user, undefined);
        assert.notEqual(user.id, '');
        assert.equal(user.firstname, 'NicolasCreate');
        assert.equal(user.lastname, 'PloquinCreate');
        assert.equal(user.password, md5('firstpasswordCreate'));
        assert.equal(user.email, 'othermail@gmail.com');
        assert.equal(user.role, 'userCreate');
        done();
      });
    });
  });
  it('should have 409 on /signup if user already exists', function(done) {
    request(server)
    .post('/signup')
    .send({ password: 'dfgghdghdghdgh', firstname: 'prénom', lastname: 'nom de famille', role: 'user', email: 'ploquin.nicolas@gmail.com'})
    .end(function(err, res){
      assert.equal(res.status, 409);
      assert.equal(res.body.message, 'User already exists');
      User.model.findOne({email: 'ploquin.nicolas@gmail.com'}, function(err, user) {
        assert.equal(err, undefined);
        assert.notEqual(user, undefined);
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
