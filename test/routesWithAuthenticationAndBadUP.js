describe('Routes with authentication enabled, Wrong username/password provided.', () => {

  var server;
  var username;
  var password;

  beforeEach(function () {
    process.env.NODE_CONFIG='{"enableAuthentication": true}'
    server = require('../server', { bustCache: true });
    username = config.username.split('').reverse().join('')
    password = config.username.split('').reverse().join('')
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('GET / ', () => {
    it('it should return a 401', (done) => {
      chai.request(server)
        .get('/')
        .auth(username, password)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('GET /api/ ', () => {
    it('it should return a 401', (done) => {
      chai.request(server)
        .get('/api')
        .auth(username, password)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe('GET /api/v1/ ', () => {
    it('it should return a 401', (done) => {
      chai.request(server)
        .get('/api/v1')
        .auth(username, password)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
