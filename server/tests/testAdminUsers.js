var assert = require('assert');
var request = require('supertest');
var jwt = require('jwt-simple');
var User = require('../models/User');
var md5 = require('md5');

var utilisateur1 = { email: 'ploquin.nicolas_1@gmail.com', password: 'password_1', firstname: 'Nicolas_1', lastname: 'Ploquin_1', role: 'admin'};
var utilisateur2 = { email: 'ploquin.nicolas_2@gmail.com', password: 'password_2', firstname: 'Nicolas_2', lastname: 'Ploquin_2', role: 'admin_2'};
var utilisateur3 = { email: 'ploquin.nicolas_3@gmail.com', password: 'password_3', firstname: 'Nicolas_3', lastname: 'Ploquin_3', role: 'admin_3'};

var utilisateurs = [utilisateur1, utilisateur2, utilisateur3];

var adminUserId;

process.env.MONGO_URL = 'mongodb://localhost:27017/booking_test';

describe('Test /api/v1/admin/user* services', function () {
  var server;
  beforeEach(function (done) {
    delete require.cache[require.resolve('../server')];
    server = require('../server');
    User.addUser( utilisateur1, function(user) {
      adminUserId = user.id;
      User.addUser( utilisateur2, function(user) {
        User.addUser( utilisateur3, function(user) {
          done();
        });
      });
    });
    
  });
  afterEach(function(done) {
    User.model.remove({}, function() {
      server.close(done);
    });
  });
  it('should have 200 on get /api/v1/admin/users with all users', function(done) {
    request(server)
    .get('/api/v1/admin/users')
    .set('authorization', genToken({ id: adminUserId}, 1))
    .end(function(err, res){
      assert.equal(res.status, 200);
      for(var i in utilisateurs) {
        assert.notEqual('', res.body[i].id);
        assert.equal(utilisateurs[i].email, res.body[i].email);
        assert.equal(utilisateurs[i].firstname, res.body[i].firstname);
        assert.equal(utilisateurs[i].lastname, res.body[i].lastname);
        assert.equal(utilisateurs[i].role, res.body[i].role);
      }
      done();
    });
  });
  it('should have 200 on get /api/v1/admin/user/:id with user information', function(done) {
    var utilisateur4 = { email: 'ploquin.nicolas_4@gmail.com', password: 'password_4', firstname: 'Nicolas_4', lastname: 'Ploquin_4', role: 'admin_4'};
    User.addUser( utilisateur4, function(user) {
      request(server)
      .get('/api/v1/admin/user/'+user.id)
      .set('authorization', genToken({ id: adminUserId}, 1))
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(user.id, res.body.id);
        assert.equal(utilisateur4.email, res.body.email);
        assert.equal(utilisateur4.firstname, res.body.firstname);
        assert.equal(utilisateur4.lastname, res.body.lastname);
        assert.equal(utilisateur4.role, res.body.role);
        done();
      });
    });
  });
  it('should have 409 on post /api/v1/admin/user/ for create user with same email than other', function(done) {
    var utilisateur4 = { email: 'ploquin.nicolas_1@gmail.com', password: 'password_4', firstname: 'Nicolas_4', lastname: 'Ploquin_4', role: 'admin_4'};
    request(server)
    .post('/api/v1/admin/user/')
    .set('authorization', genToken({ id: adminUserId}, 1))
    .send(utilisateur4)
    .end(function(err, res){
      assert.equal(res.status, 409);
      assert.equal(res.body.status, 409);
      assert.equal(res.body.message, "User already exists");
      done();
    });
  });
  it('should have 500 on post /api/v1/admin/user/ for create new user without password', function(done) {
    var utilisateur4 = { email: 'ploquin.nicolas_4@gmail.com', password: '', firstname: 'Nicolas_4', lastname: 'Ploquin_4', role: 'admin_4'};
    request(server)
    .post('/api/v1/admin/user/')
    .set('authorization', genToken({ id: adminUserId}, 1))
    .send(utilisateur4)
    .end(function(err, res){
      assert.equal(res.status, 500);
      assert.equal(res.body.status, 500);
      assert.equal(res.body.message, 'Error occured: Password should not be empty');
      done();
    });
  });
  it('should have 200 on post /api/v1/admin/user/ for create new user', function(done) {
    var utilisateur4 = { email: 'ploquin.nicolas_4@gmail.com', password: 'password_4', firstname: 'Nicolas_4', lastname: 'Ploquin_4', role: 'admin_4'};
    request(server)
    .post('/api/v1/admin/user/')
    .set('authorization', genToken({ id: adminUserId}, 1))
    .send(utilisateur4)
    .end(function(err, res){
      assert.equal(res.status, 200);
      assert.notEqual('', res.body.id);
      assert.equal(utilisateur4.email, res.body.user.email);
      assert.equal(utilisateur4.firstname, res.body.user.firstname);
      assert.equal(utilisateur4.lastname, res.body.user.lastname);
      assert.equal(utilisateur4.role, res.body.user.role);
      User.model.findOne({email: 'ploquin.nicolas_4@gmail.com'}, function(err, user) {
        assert.equal(undefined, err);
        assert.notEqual(undefined, user);
        assert.notEqual('', user.id);
        assert.equal(user.firstname, 'Nicolas_4');
        assert.equal(user.lastname, 'Ploquin_4');
        assert.equal(user.password, md5('password_4'));
        assert.equal(user.email, 'ploquin.nicolas_4@gmail.com');
        assert.equal(user.role, 'admin_4');
        done();
      });
    });
  });
  it('should have 500 on put /api/v1/admin/user/:id with updated user with password empty', function(done) {
    var infoUpdate = { email: 'ploquin.nicolas_updated@gmail.com', password: '', firstname: 'Nicolas_updated', lastname: 'Ploquin_updated', role: 'admin_updated'};
    User.model.findOne({email: utilisateur2.email}, function(err, user) {
      assert.equal(utilisateur2.email, user.email);
      assert.equal(utilisateur2.firstname, user.firstname);
      assert.equal(utilisateur2.lastname, user.lastname);
      assert.equal(utilisateur2.role, user.role);
      request(server)
      .put('/api/v1/admin/user/'+user.id)
      .set('authorization', genToken({ id: adminUserId}, 1))
      .send(infoUpdate)
      .end(function(err, res){
        assert.equal(res.status, 500);
        assert.equal(res.body.status, 500);
        assert.equal(res.body.message, 'Error occured: Password should not be empty');
        done();
      });
    });
  });
  it('should have 200 on put /api/v1/admin/user/:id with updated user', function(done) {
    var infoUpdate = { email: 'ploquin.nicolas_updated@gmail.com', password: 'password_updated', firstname: 'Nicolas_updated', lastname: 'Ploquin_updated', role: 'admin_updated'};
    User.model.findOne({email: utilisateur2.email}, function(err, user) {
      assert.equal(utilisateur2.email, user.email);
      assert.equal(utilisateur2.firstname, user.firstname);
      assert.equal(utilisateur2.lastname, user.lastname);
      assert.equal(utilisateur2.role, user.role);
      request(server)
      .put('/api/v1/admin/user/'+user.id)
      .set('authorization', genToken({ id: adminUserId}, 1))
      .send(infoUpdate)
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(user.id, res.body.user.id);
        assert.equal(infoUpdate.email, res.body.user.email);
        assert.equal(infoUpdate.firstname, res.body.user.firstname);
        assert.equal(infoUpdate.lastname, res.body.user.lastname);
        assert.equal(infoUpdate.role, res.body.user.role);
        done();
      });
    });
  });
  it('should have 200 on delete /api/v1/admin/user/:id with old user', function(done) {
    User.model.findOne({email: utilisateur2.email}, function(err, user) {
      assert.equal(utilisateur2.email, user.email);
      assert.equal(utilisateur2.firstname, user.firstname);
      assert.equal(utilisateur2.lastname, user.lastname);
      assert.equal(utilisateur2.role, user.role);
      request(server)
      .delete('/api/v1/admin/user/'+user.id)
      .set('authorization', genToken({ id: adminUserId}, 1))
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(user.id, res.body.user.id);
        assert.equal(utilisateur2.email, res.body.user.email);
        assert.equal(utilisateur2.firstname, res.body.user.firstname);
        assert.equal(utilisateur2.lastname, res.body.user.lastname);
        assert.equal(utilisateur2.role, res.body.user.role);
        done();
      });
    });
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
