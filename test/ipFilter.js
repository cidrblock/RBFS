describe('IP Filter: permit all.', () => {

  var server;
  beforeEach(function () {
    process.env.NODE_CONFIG='{"ipFilter": [ "0.0.0.0/0", "::/0"], "ipFilterMode": "allow", "ipFilterLog": false}'
    server = require('../server', { bustCache: true });
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('/GET /api/v1/ ', () => {
    it('it should return a 200', (done) => {
      chai.request(server)
        .get('/api/v1')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});


describe('IP Filter: deny all.', () => {

  var server;
  beforeEach(function () {
    process.env.NODE_CONFIG='{"ipFilter": [ "0.0.0.0/0", "::/0"], "ipFilterMode": "deny", "ipFilterLog": false}'
    server = require('../server', { bustCache: true });
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('/GET /api/v1/ ', () => {
    it('it should return a 401', (done) => {
      chai.request(server)
        .get('/api/v1')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});


describe('IP Filter: permit localhost.', () => {

  var server;
  beforeEach(function () {
    process.env.NODE_CONFIG='{"ipFilter": [ "127.0.0.1", "::ffff:127.0.0.1"], "ipFilterMode": "allow", "ipFilterLog": false}'
    server = require('../server', { bustCache: true });
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('/GET /api/v1/ ', () => {
    it('it should return a 200', (done) => {
      chai.request(server)
        .get('/api/v1')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});

describe('IP Filter: deny localhost.', () => {

  var server;
  beforeEach(function () {
    process.env.NODE_CONFIG='{"ipFilter": [ "127.0.0.1", "::ffff:127.0.0.1"], "ipFilterMode": "deny", "ipFilterLog": false}'
    server = require('../server', { bustCache: true });
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('/GET /api/v1/ ', () => {
    it('it should return a 401', (done) => {
      chai.request(server)
        .get('/api/v1')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
