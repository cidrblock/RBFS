var fs = require('fs')

describe('File.', () => {

  var server;
  beforeEach(function () {
    server = require('../server', { bustCache: true });
  });

  afterEach(function (done) {
    server.close(done);
  });

  describe('GET /api/v1/file.txt (Non-existent file)', () => {
    it('it should return a 404', (done) => {
      chai.request(server)
        .get('/api/v1/file.txt')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('PUT /api/v1/file.txt (Put new file)', () => {
    it('it should return a 200', (done) => {
      chai.request(server)
        .put('/api/v1/file.txt')
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

  describe('GET /api/v1/file.txt (Get file)', () => {
    it('it should return a 200 and be text', (done) => {
      chai.request(server)
        .get('/api/v1/file.txt')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.text
          done();
        });
    });
  });

  describe('GET /api/v1/mdf/file.txt (Get file MD5)', () => {
    it('it should return a 200 and be json', (done) => {
      chai.request(server)
        .get('/api/v1/md5/file.txt')
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

  describe('GET /api/v1/history/file.txt (Get new file history)', () => {
    it('it should return a 200 and be json', (done) => {
      chai.request(server)
        .get('/api/v1/history/file.txt')
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

  describe('POST /api/v1/file.txt (Overwrite existing file)', () => {
    it('it should return a 200', (done) => {
      chai.request(server)
        .post('/api/v1/file.txt')
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

  describe('GET /api/v1/file.txt (Get modified file)', () => {
    it('it should return a 200 and be text', (done) => {
      chai.request(server)
        .get('/api/v1/file.txt')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.text
          done();
        });
    });
  });

  describe('GET /api/v1/mdf/file.txt (Get modified file MD5)', () => {
    it('it should return a 200 and be json', (done) => {
      chai.request(server)
        .get('/api/v1/md5/file.txt')
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

  describe('GET /api/v1/history/file.txt (Get modified file history)', () => {
    it('it should return a 200 and be json', (done) => {
      chai.request(server)
        .get('/api/v1/history/file.txt')
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

  describe('DELETE /api/v1/file.txt (Delete file)', () => {
    it('it should return a 200 and be json', (done) => {
      chai.request(server)
        .delete('/api/v1/file.txt')
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

  describe('GET /api/v1/file.txt (Non-existent file)', () => {
    it('it should return a 404', (done) => {
      chai.request(server)
        .get('/api/v1/file.txt')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('GET /api/v1/history/file.txt (Non-existent history)', () => {
    it('it should return a 404', (done) => {
      chai.request(server)
        .get('/api/v1/history/file.txt')
        .auth(config.username, config.password)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });





  //
  // { action: 'created',
  //   size: 29,
  //   humanSize: '29 B',
  //   md5: 'bcca77a872c20e8a8a7bf7be6b228d22',
  //   md5ValidationRequested: false,
  //   md5Validated: false,
  //   modified: '2016-12-10T16:31:21.000Z',
  //   sourceIP: '127.0.0.1',
  //   sourceDNSName: '',
  //   userData: {} }


  //
  // describe('GET /api/v1/ ', () => {
  //   it('it should return a 200', (done) => {
  //     chai.request(server)
  //       .get('/api/v1')
  //       .auth(config.username, config.password)
  //       .end((err, res) => {
  //         res.should.have.status(200);
  //         done();
  //       });
  //   });
  // });
});
