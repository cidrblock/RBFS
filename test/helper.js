// globals
global.assert = require('assert');
global.chai = require('chai');
global.chaiHttp = require('chai-http');
global.should = chai.should();

chai.use(chaiHttp);

// setup
before( function () {} );
beforeEach(function () {
  delete require.cache[require.resolve('../server')];
  delete require.cache[require.resolve('config')];
  process.env.NODE_CONFIG='{}'
});

// teardown
after( function () {});
afterEach( function () {});
