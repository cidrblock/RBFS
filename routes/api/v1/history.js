var express = require('express')
var router = express.Router()
var common = require('./lib/common')
var fs = require('fs-extra');
var mime = require('mime')

router.get(/^(.*)$/, function(req, res) {
  var fileName = config.baseDirectory + req.params[0] + config.historyExtention
  fs.readFile(fileName, function (err, data) {
    if (err) {
        common.resError("Error: Filed to read requested file.", err, res);
    } else {
        // Set the mimetype based on the extention
        var mimeType = mime.lookup(fileName);
        res.writeHead(200, {
          'Content-Type': mimeType,
        });
        res.end(data);
    }
  });
});

module.exports = router;
