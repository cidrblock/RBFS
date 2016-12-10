var fs = require('fs')
var deepFile = 'a/b/c/d/e/f/g/file.txt'

describe('File. Deeply nested', () => {

  var server;
  beforeEach(function () {
    server = require('../server', { bustCache: true });
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('GET /api/v1/' + deepFile + ' (Non-existent file)', () => {
    it('it should return a 404', (done) => {
      chai.request(server)
        .get('/api/v1/' + deepFile)
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('GET /api/v1/a/b/c/d/e/f/g/ (Non-existent directory)', () => {
    it('it should return a 200 with null data.', (done) => {
      chai.request(server)
        .get('/api/v1/a/b/c/d/e/f/g/')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data').eql(null)
          done();
        });
    });
  });


  describe('PUT /api/v1/' + deepFile + ' (Put new file)', () => {
    it('it should return a 200', (done) => {
      chai.request(server)
      .put('/api/v1/' + deepFile)
        .auth(config.username, config.password)
        .attach('file', __dirname + '/file.txt')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data').should.be.a('object')
          res.body.data.should.have.property('md5').to.be.a('string')
          res.body.data.should.have.property('history').to.be.a('string')
          res.body.data.should.have.property('url').to.be.a('string')
          done();
        });
    });
  });

  describe('GET /api/v1/' + deepFile + ' (Get file)', () => {
    it('it should return a 200 and be text', (done) => {
      chai.request(server)
        .get('/api/v1/' + deepFile)
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.text
          done();
        });
    });
  });

  describe('GET /api/v1/mdf/' + deepFile + ' (Get file MD5)', () => {
    it('it should return a 200 and be json', (done) => {
      chai.request(server)
        .get('/api/v1/md5/' + deepFile)
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json
          res.body.should.be.a('object')
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data').should.be.a('object')
          res.body.data.should.have.property('md5').eql('bcca77a872c20e8a8a7bf7be6b228d22')
          done();
        });
    });
  });

  describe('GET /api/v1/history/' + deepFile + ' (Get new file history)', () => {
    it('it should return a 200 and be json', (done) => {
      chai.request(server)
        .get('/api/v1/history/' + deepFile)
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json
          res.body.should.be.a('array')
          res.body[0].should.have.property('action').eql('created')
          res.body[0].should.have.property('size').eql(29)
          res.body[0].should.have.property('humanSize').eql('29 B')
          res.body[0].should.have.property('md5').eql('bcca77a872c20e8a8a7bf7be6b228d22')
          res.body[0].should.have.property('md5ValidationRequested').eql(false)
          res.body[0].should.have.property('md5Validated').eql(false)
          res.body[0].should.have.property('modified').to.be.a('string')
          res.body[0].should.have.property('sourceIP').to.be.a('string')
          res.body[0].should.have.property('sourceDNSName').to.be.a('string')
          res.body[0].should.have.property('userData').to.be.a('object')
          done();
        });
    });
  });

  describe('POST /api/v1/' + deepFile + ' (Overwrite existing file)', () => {
    it('it should return a 200', (done) => {
      chai.request(server)
        .post('/api/v1/' + deepFile)
        .auth(config.username, config.password)
        .attach('file', __dirname + '/file1.txt')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data').should.be.a('object')
          res.body.data.should.have.property('md5').eql('73533b265370ce3730805c8a9d7e0909')
          res.body.data.should.have.property('history').to.be.a('string')
          res.body.data.should.have.property('url').to.be.a('string')
          done();
        });
    });
  });

  describe('GET /api/v1/' + deepFile + ' (Get modified file)', () => {
    it('it should return a 200 and be text', (done) => {
      chai.request(server)
        .get('/api/v1/' + deepFile)
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.text
          done();
        });
    });
  });

  describe('GET /api/v1/mdf/' + deepFile + ' (Get modified file MD5)', () => {
    it('it should return a 200 and be json', (done) => {
      chai.request(server)
        .get('/api/v1/md5/' + deepFile)
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json
          res.body.should.be.a('object')
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data').should.be.a('object')
          res.body.data.should.have.property('md5').eql('73533b265370ce3730805c8a9d7e0909')
          done();
        });
    });
  });

  describe('GET /api/v1/history/' + deepFile + ' (Get modified file history)', () => {
    it('it should return a 200 and be json', (done) => {
      chai.request(server)
        .get('/api/v1/history/' + deepFile)
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json
          res.body.should.be.a('array')
          res.body[1].should.have.property('action').eql('updated')
          res.body[1].should.have.property('size').eql(29)
          res.body[1].should.have.property('humanSize').eql('29 B')
          res.body[1].should.have.property('md5').eql('73533b265370ce3730805c8a9d7e0909')
          res.body[1].should.have.property('md5ValidationRequested').eql(false)
          res.body[1].should.have.property('md5Validated').eql(false)
          res.body[1].should.have.property('modified').to.be.a('string')
          res.body[1].should.have.property('sourceIP').to.be.a('string')
          res.body[1].should.have.property('sourceDNSName').to.be.a('string')
          res.body[1].should.have.property('userData').to.be.a('object')
          done();
        });
    });
  });

  describe('DELETE /api/v1/' + deepFile + ' (Delete file)', () => {
    it('it should return a 200 and be json', (done) => {
      chai.request(server)
        .delete('/api/v1/' + deepFile)
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json
          res.body.should.be.a('object')
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data').should.be.a('object')
          res.body.data.should.have.property('message').to.be.a('string')
          done();
        });
    });
  });

  describe('DELETE /api/v1/ (Delete everything)', () => {
    it('it should return a 200 and be json', (done) => {
      chai.request(server)
        .delete('/api/v1/')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json
          res.body.should.be.a('object')
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data').should.be.a('object')
          // res.body.data.should.have.property('message').to.be.a('string')
          done();
        });
    });
  });

  describe('GET /api/v1/' + deepFile + ' (Non-existent file)', () => {
    it('it should return a 404', (done) => {
      chai.request(server)
        .get('/api/v1/' + deepFile)
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('GET /api/v1/history/' + deepFile + ' (Non-existent history)', () => {
    it('it should return a 404', (done) => {
      chai.request(server)
        .get('/api/v1/history/' + deepFile)
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

});
