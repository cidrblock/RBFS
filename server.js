// var yaml = require('node-yaml')
// global.config = yaml.readSync('./config/config.yaml')

var express = require('express')
var app = express();
var formidable = require('./lib/express-formidable');
var http = require('http');
var https = require('https');
var basicAuth = require('basic-auth');
var ipfilter = require('express-ipfilter').IpFilter;
var IpDeniedError = require('express-ipfilter').IpDeniedError;
var findRemoveSync = require('find-remove')
var fs = require('fs');
global.config = require('config');

var server

//
// Determine if SSL is used
//
if (config.ssl.key && config.ssl.cert) {
  // Get CERT
  options = {
    key: fs.readFileSync(config.ssl.cert, 'utf8'),
    cert: fs.readFileSync(config.ssl.key, 'utf8')
  };
  console.log(options)
  // Config server with SSL
  server = https.createServer(options, app)
} else {
  // Config non-SSL Server
  options = {}
  server = http.createServer(app)
}

//
// Basic Auth
//
//
// Enable authentication if specified in config
//
var auth = function (req, res, next) {
  function unauthorized(res) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
  };

  var user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === config.username && user.pass === config.password) {
    return next();
  } else {
    return unauthorized(res);
  }
};

//
// Auth first
//
if (config.enableAuthentication) { app.use(auth) }
//
// Then whitelist
//
var ipFilterOptions = {
  mode: config.ipFilterMode,
  log: config.ipFilterLog,
  logLevel: config.ipFilterLogLevel
}
app.use(ipfilter(config.ipFilter, ipFilterOptions ));
app.use(function(err, req, res, next) {
  if (err) {
    if(err instanceof IpDeniedError){
      res.status(401).json({'message': 'Denied.'})
    } else {
      res.status(500)
    }
  } else {
    next()
  }
})

//
// now formidable
//

app.use(formidable({
  uploadDir: config.tempDirectory
}));

//
// Clean the upload directory every hour
//

setInterval(findRemoveSync.bind(config.uploadDir, {age: {seconds: 3600}, ignore: '.gitignore' }), 360000)

//
// START SERVER
//
app.use('/api', require('./routes/api'));
server.listen(process.env.PORT || config.PORT, function(){
  // silence during testing please
  if (app.settings.env != 'test') {
    console.log("Express server listening on port " + config.PORT);
  }
});

module.exports = server; // for testing
