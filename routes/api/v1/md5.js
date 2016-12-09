var express = require('express')
var router = express.Router()
var common = require('./lib/common')
var md5File = require('md5-file');

router.get(/^(.*)$/, function(req, res) {
  var fileName = settings.baseDirectory + req.params[0]
  md5File(fileName, function (err, hash) {
    if (err) {
      var msg = 'Error calculating MD5 for file.'
      common.resError({ 'message': msg, 'err': err });
    } else {
      var response = {}
      response.md5 = hash
      common.resSuccess(response, res);
    }
  })
});

module.exports = router;
