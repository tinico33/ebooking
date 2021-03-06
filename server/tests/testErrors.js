var assert = require('assert');
var request = require('supertest');
var tools = require('./testTools');

describe('Test errors', function() {
  var server;
  beforeEach(function() {
    server = tools.newServer();
  });
  afterEach(function(done) {
    server.close(done);
  });
  it('404 on /', function(done) {
    request(server)
      .get('/')
      .end(function(err, res) {
        assert.equal(res.status, 404);
        assert.equal(res.body.status, 404);
        assert.equal(res.body.message, 'Not Found');
        done();
      });
  });
});