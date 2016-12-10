describe('Routes without authentication disabled.', () => {

  var server;
  beforeEach(function () {
    process.env.NODE_CONFIG='{"enableAuthentication": false}'
    server = require('../server', { bustCache: true });
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('GET /', () => {

    it('it should return a 404', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
  describe('GET /api/', () => {
    it('it should return a 404', (done) => {
      chai.request(server)
        .get('/api')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('GET /api/v1/', () => {
    it('it should return a 200', (done) => {
      chai.request(server)
        .get('/api/v1/')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object')
          done();
        });
    });
  });

});
