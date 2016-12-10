describe('Routes with authentication enabled, Username/password provided.', () => {

  var server;
  beforeEach(function () {
    process.env.NODE_CONFIG='{"enableAuthentication": true}'
    server = require('../server', { bustCache: true });
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('GET / ', () => {
    it('it should return a 404', (done) => {
      chai.request(server)
        .get('/')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('GET /api/ ', () => {
    it('it should return a 404', (done) => {
      chai.request(server)
        .get('/api')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('GET /api/v1/ ', () => {
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
