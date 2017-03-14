var assert = require('assert');
var request = require('supertest');
var User = require('../models/User');
var Seance = require('../models/Seance');
var tools = require('./testTools');

var administrator = {
  email: 'ploquin.nicolas@gmail.com',
  password: 'password',
  firstname: 'Nicolas',
  lastname: 'Ploquin',
  role: 'admin'
};

var administratorId;

var seance = {
  title: 'Première séance',
  start: new Date(2017, 0, 20, 10, 0, 0, 0),
  end: new Date(2017, 0, 20, 12, 0, 0, 0),
};

var seance2 = {
  title: 'Seconde séance',
  start: new Date(2017, 0, 21, 14, 0, 0, 0),
  end: new Date(2017, 0, 21, 16, 0, 0, 0),
};

var seance3 = {
  title: 'Troisième séance',
  start: new Date(2017, 0, 21, 18, 0, 0, 0),
  end: new Date(2017, 0, 21, 20, 0, 0, 0),
};

var seances = [seance, seance2, seance3];

var firstSeanceId;

var server;

describe('Test /api/v1/admin/seance* services', function() {

  beforeEach(function(done) {
    server = tools.newServer();
    User.addUser(administrator, function(user) {
      administratorId = user.id;
      Seance.addSeance(seance, function(seance) {
        firstSeanceId = seance._id;
        Seance.addSeance(seance2, function(seance) {
          Seance.addSeance(seance3, function(seance) {
            done();
          });
        });
      });
    }, function(err) {
      console.log(err);
    });
  });

  afterEach(function(done) {
    tools.removeAll(done);
  });
  it('should have 200 on get /api/v1/admin/seances with all seances', function(done) {
    request(server)
      .get('/api/v1/admin/seances')
      .set('x-access-token', tools.genToken({
        _id: administratorId
      }, 1).token)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        for (var i in seances) {
          assert.notEqual('', res.body[i]._id);
          assert.equal(seances[i].title, res.body[i].title);
          assert.equal(seances[i].start.getTime(), new Date(res.body[i].start).getTime());
          assert.equal(seances[i].end.getTime(), new Date(res.body[i].end).getTime());
        }
        done();
      });
  });
  it('should have 200 on get /api/v1/admin/seance/:id with seance information', function(done) {
    request(server)
      .get('/api/v1/admin/seance/' + firstSeanceId)
      .set('x-access-token', tools.genToken({
        _id: administratorId
      }, 1).token)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.notEqual('', res.body._id);
        assert.equal(seance.title, res.body.title);
        assert.equal(seance.start.getTime(), new Date(res.body.start).getTime());
        assert.equal(seance.end.getTime(), new Date(res.body.end).getTime());
        done();
      });
  });
  it('should have 500 on post /api/v1/admin/seance/ for create new seance without title', function(done) {
    var seanceSansTitle = {
      title: '',
      start: new Date(2017, 0, 20, 10, 0, 0, 0),
      end: new Date(2017, 0, 20, 12, 0, 0, 0),
    };
    request(server)
      .post('/api/v1/admin/seance/')
      .set('x-access-token', tools.genToken({
        _id: administratorId
      }, 1).token)
      .send(seanceSansTitle)
      .end(function(err, res) {
        assert.equal(res.status, 500);
        assert.equal(res.body.status, 500);
        assert.ok(res.body.message.includes('Error occured: '));
        done();
      });
  });
  it('should have 500 on post /api/v1/admin/seance/ for create new seance without start date', function(done) {
    var seanceSansTitle = {
      title: 'Seance without start date',
      end: new Date(2017, 0, 20, 12, 0, 0, 0),
    };
    request(server)
      .post('/api/v1/admin/seance/')
      .set('x-access-token', tools.genToken({
        _id: administratorId
      }, 1).token)
      .send(seanceSansTitle)
      .end(function(err, res) {
        assert.equal(res.status, 500);
        assert.equal(res.body.status, 500);
        assert.ok(res.body.message.includes('Error occured: '));
        done();
      });
  });
  it('should have 500 on post /api/v1/admin/seance/ for create new seance without end date', function(done) {
    var seanceSansTitle = {
      title: 'Seance without end date',
      start: new Date(2017, 0, 20, 10, 0, 0, 0),
    };
    request(server)
      .post('/api/v1/admin/seance/')
      .set('x-access-token', tools.genToken({
        _id: administratorId
      }, 1).token)
      .send(seanceSansTitle)
      .end(function(err, res) {
        assert.equal(res.status, 500);
        assert.equal(res.body.status, 500);
        assert.ok(res.body.message.includes('Error occured: '));
        done();
      });
  });
  /*it('should have 200 on post /api/v1/admin/user/ for create new user', function(done) {
    var utilisateur4 = {
      email: 'ploquin.nicolas_4@gmail.com',
      password: 'password_4',
      firstname: 'Nicolas_4',
      lastname: 'Ploquin_4',
      role: 'admin_4'
    };
    request(server)
      .post('/api/v1/admin/user/')
      .set('x-access-token', tools.genToken({
        _id: adminUserId
      }, 1).token)
      .send(utilisateur4)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.notEqual('', res.body.id);
        assert.equal(utilisateur4.email, res.body.user.email);
        assert.equal(utilisateur4.firstname, res.body.user.firstname);
        assert.equal(utilisateur4.lastname, res.body.user.lastname);
        assert.equal(utilisateur4.role, res.body.user.role);
        User.model.findOne({
          email: 'ploquin.nicolas_4@gmail.com'
        }, function(err, user) {
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
    var infoUpdate = {
      email: 'ploquin.nicolas_updated@gmail.com',
      password: '',
      firstname: 'Nicolas_updated',
      lastname: 'Ploquin_updated',
      role: 'admin_updated'
    };
    User.model.findOne({
      email: utilisateur2.email
    }, function(err, user) {
      assert.equal(utilisateur2.email, user.email);
      assert.equal(utilisateur2.firstname, user.firstname);
      assert.equal(utilisateur2.lastname, user.lastname);
      assert.equal(utilisateur2.role, user.role);
      request(server)
        .put('/api/v1/admin/user/' + user.id)
        .set('x-access-token', tools.genToken({
          _id: adminUserId
        }, 1).token)
        .send(infoUpdate)
        .end(function(err, res) {
          assert.equal(res.status, 500);
          assert.equal(res.body.status, 500);
          assert.equal(res.body.message, 'Error occured: Password should not be empty');
          done();
        });
    });
  });
  it('should have 200 on put /api/v1/admin/user/:id with updated user', function(done) {
    var infoUpdate = {
      email: 'ploquin.nicolas_updated@gmail.com',
      password: 'password_updated',
      firstname: 'Nicolas_updated',
      lastname: 'Ploquin_updated',
      role: 'admin_updated'
    };
    User.model.findOne({
      email: utilisateur2.email
    }, function(err, user) {
      assert.equal(utilisateur2.email, user.email);
      assert.equal(utilisateur2.firstname, user.firstname);
      assert.equal(utilisateur2.lastname, user.lastname);
      assert.equal(utilisateur2.role, user.role);
      request(server)
        .put('/api/v1/admin/user/' + user.id)
        .set('x-access-token', tools.genToken({
          _id: adminUserId
        }, 1).token)
        .send(infoUpdate)
        .end(function(err, res) {
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
    User.model.findOne({
      email: utilisateur2.email
    }, function(err, user) {
      assert.equal(utilisateur2.email, user.email);
      assert.equal(utilisateur2.firstname, user.firstname);
      assert.equal(utilisateur2.lastname, user.lastname);
      assert.equal(utilisateur2.role, user.role);
      request(server)
        .delete('/api/v1/admin/user/' + user.id)
        .set('x-access-token', tools.genToken({
          _id: adminUserId
        }, 1).token)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(user.id, res.body.user.id);
          assert.equal(utilisateur2.email, res.body.user.email);
          assert.equal(utilisateur2.firstname, res.body.user.firstname);
          assert.equal(utilisateur2.lastname, res.body.user.lastname);
          assert.equal(utilisateur2.role, res.body.user.role);
          done();
        });
    });
  });*/
});