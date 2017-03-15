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

var seance1 = {
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

var seances = [seance1, seance2, seance3];

var firstSeanceId;

var server;

describe('Test /api/v1/admin/seance* services', function() {

  beforeEach(function(done) {
    server = tools.newServer();
    User.addUser(administrator, function(user) {
      administratorId = user.id;
      Seance.addSeance(seance1, function(seance) {
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
        assert.equal(seance1.title, res.body.title);
        assert.equal(seance1.start.getTime(), new Date(res.body.start).getTime());
        assert.equal(seance1.end.getTime(), new Date(res.body.end).getTime());
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
  it('should have 200 on post /api/v1/admin/seance/ for create new seance', function(done) {
    var seanceToAdd = {
      title: 'Title',
      start: new Date(2017, 0, 20, 10, 0, 0, 0),
      end: new Date(2017, 0, 20, 12, 0, 0, 0),
    };
    request(server)
      .post('/api/v1/admin/seance/')
      .set('x-access-token', tools.genToken({
        _id: administratorId
      }, 1).token)
      .send(seanceToAdd)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.notEqual('', res.body.id);
        assert.equal(seanceToAdd.title, res.body.title);
        assert.equal(seanceToAdd.start.getTime(), new Date(res.body.start).getTime());
        assert.equal(seanceToAdd.end.getTime(), new Date(res.body.end).getTime());
        Seance.model.findOne({
          title: 'Title'
        }, function(err, seance) {
          assert.equal(undefined, err);
          assert.notEqual(undefined, seance);
          assert.notEqual('', seance._id);
          assert.equal(seanceToAdd.title, seance.title);
          assert.equal(seanceToAdd.start.getTime(), new Date(seance.start).getTime());
          assert.equal(seanceToAdd.end.getTime(), new Date(seance.end).getTime());
          done();
        });
      });
  });
  it('should have 200 on put /api/v1/admin/seance/:id with updated seance', function(done) {
    var seanceToUpdate = {
      title: 'Séance modifiée',
      start: new Date(2017, 0, 21, 14, 0, 0, 0),
      end: new Date(2017, 0, 21, 16, 0, 0, 0),
    }
    Seance.model.findById(
      firstSeanceId,
      function(err, seance) {
        assert.equal(seance1.title, seance.title);
        assert.equal(seance1.start.getTime(), new Date(seance.start).getTime());
        assert.equal(seance1.end.getTime(), new Date(seance.end).getTime());
        request(server)
          .put('/api/v1/admin/seance/' + firstSeanceId)
          .set('x-access-token', tools.genToken({
            _id: administratorId
          }, 1).token)
          .send(seanceToUpdate)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(seanceToUpdate.title, res.body.title);
            assert.equal(seanceToUpdate.start.getTime(), new Date(res.body.start).getTime());
            assert.equal(seanceToUpdate.end.getTime(), new Date(res.body.end).getTime());
            done();
          });
      });
  });
  it('should have 500 on put /api/v1/admin/seance/:id with empty start date', function(done) {
    var seanceToUpdate = {
      title: 'Séance modifiée',
      end: new Date(2017, 0, 21, 16, 0, 0, 0),
    }
    Seance.model.findById(
      firstSeanceId,
      function(err, seance) {
        assert.equal(seance1.title, seance.title);
        assert.equal(seance1.start.getTime(), new Date(seance.start).getTime());
        assert.equal(seance1.end.getTime(), new Date(seance.end).getTime());
        request(server)
          .put('/api/v1/admin/seance/' + firstSeanceId)
          .set('x-access-token', tools.genToken({
            _id: administratorId
          }, 1).token)
          .send(seanceToUpdate)
          .end(function(err, res) {
            assert.equal(res.status, 500);
            assert.equal(res.body.status, 500);
            assert.ok(res.body.message.includes('Error occured: '));
            done();
          });
      });
  });
  it('should have 500 on put /api/v1/admin/seance/:id with empty end date', function(done) {
    var seanceToUpdate = {
      title: 'Séance modifiée',
      start: new Date(2017, 0, 21, 14, 0, 0, 0),
    }
    Seance.model.findById(
      firstSeanceId,
      function(err, seance) {
        assert.equal(seance1.title, seance.title);
        assert.equal(seance1.start.getTime(), new Date(seance.start).getTime());
        assert.equal(seance1.end.getTime(), new Date(seance.end).getTime());
        request(server)
          .put('/api/v1/admin/seance/' + firstSeanceId)
          .set('x-access-token', tools.genToken({
            _id: administratorId
          }, 1).token)
          .send(seanceToUpdate)
          .end(function(err, res) {
            assert.equal(res.status, 500);
            assert.equal(res.body.status, 500);
            assert.ok(res.body.message.includes('Error occured: '));
            done();
          });
      });
  });
  it('should have 500 on put /api/v1/admin/seance/:id with empty title date', function(done) {
    var seanceToUpdate = {
      start: new Date(2017, 0, 21, 14, 0, 0, 0),
      end: new Date(2017, 0, 21, 16, 0, 0, 0),
    }
    Seance.model.findById(
      firstSeanceId,
      function(err, seance) {
        assert.equal(seance1.title, seance.title);
        assert.equal(seance1.start.getTime(), new Date(seance.start).getTime());
        assert.equal(seance1.end.getTime(), new Date(seance.end).getTime());
        request(server)
          .put('/api/v1/admin/seance/' + firstSeanceId)
          .set('x-access-token', tools.genToken({
            _id: administratorId
          }, 1).token)
          .send(seanceToUpdate)
          .end(function(err, res) {
            assert.equal(res.status, 500);
            assert.equal(res.body.status, 500);
            assert.ok(res.body.message.includes('Error occured: '));
            done();
          });
      });
  });
  it('should have 200 on delete /api/v1/admin/seance/:id with old seance', function(done) {
    Seance.model.findById(firstSeanceId, function(err, seance) {
      assert.equal(seance1.title, seance.title);
      assert.equal(seance1.start.getTime(), new Date(seance.start).getTime());
      assert.equal(seance1.end.getTime(), new Date(seance.end).getTime());
      request(server)
        .delete('/api/v1/admin/seance/' + firstSeanceId)
        .set('x-access-token', tools.genToken({
          _id: administratorId
        }, 1).token)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(seance1.title, res.body.title);
          assert.equal(seance1.start.getTime(), new Date(res.body.start).getTime());
          assert.equal(seance1.end.getTime(), new Date(res.body.end).getTime());
          done();
        });
    });
  });
});