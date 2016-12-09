var yaml = require('node-yaml')
global.settings = yaml.readSync('./config/settings.yaml')

var express = require('express')
var app = express();
var formidable = require('./lib/express-formidable');
var http = require('http');
var https = require('https');
var basicAuth = require('basic-auth');
var ipfilter = require('express-ipfilter').IpFilter;
var IpDeniedError = require('express-ipfilter').IpDeniedError;
var findRemoveSync = require('find-remove')
var server

//
// Determine if SSL is used
//
if (global.settings.ssl.key && global.settings.ssl.cert) {
  // Get CERT
  options = {
    key: fs.readFileSync(config.ssl.cert),
    cert: fs.readFileSync(config.ssl.key)
  };
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
// Enable authentication if specified in settings
//
var auth = function (req, res, next) {
  if (settings.enableAuthentication) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
    };

    var user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
      return unauthorized(res);
    };

    if (user.name === settings.username && user.pass === settings.password) {
      return next();
    } else {
      return unauthorized(res);
    }
  }
};

//
// Auth first
//
app.use( auth )

//
// Then whitelist
//
var ipFilterOptions = {
  mode: settings.ipFilterMode,
  log: settings.ipFilterLog,
  logLevel: settings.ipFilterLogLevel
}
app.use(ipfilter(settings.ipFilter, ipFilterOptions ));
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
  uploadDir: settings.tempDirectory
}));

//
// Clean the upload directory every hour
//

setInterval(findRemoveSync.bind(settings.uploadDir, {age: {seconds: 3600}, ignore: '.gitignore' }), 360000)


//
// START SERVER
//
app.use('/api', require('./routes/api'));
server.listen(settings.port, function(){
  console.log("Express server listening on port " + settings.port);
});
