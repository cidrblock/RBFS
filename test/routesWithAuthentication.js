describe('Routes with authentication enabled. No username/password provided', () => {

  var server;
  beforeEach(function () {
    process.env.NODE_CONFIG='{"enableAuthentication": true}'
    server = require('../server', { bustCache: true });
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('/GET / )', () => {
    it('it should return a 401', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET /api/ ', () => {
    it('it should return a 401', (done) => {
      chai.request(server)
        .get('/api')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('/GET /api/v1/ ', () => {
    it('it should return a 401', (done) => {
      chai.request(server)
        .get('/api/v1')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
