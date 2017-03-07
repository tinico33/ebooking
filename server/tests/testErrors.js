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
      assert.equal(res.body.status, 404);
      assert.equal(res.body.message, 'Not Found');
  	  done();
  	});
  });
});
