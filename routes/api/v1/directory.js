var express = require('express')
var router = express.Router()
var common = require('./lib/common')
var fs = require('fs-extra');
var dirTree = require('./lib/directory-tree')

//
// Check for the positive existence of a directory
//
function checkExistence (file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, data) => {
      if (err) {
        reject({ 'message': "Error: Directory doesn't exist.", 'err': err })
      } else {
        resolve()
      }
    })
  })
}

//
// Check for the negative existence of a directory
//
function checkNegativeExistence (file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, data) => {
      if (err) {
        resolve()
      } else {
        reject({ 'message': "Error: Directory exists.", 'err': err })
      }
    })
  })
}

//
// Build a new directory
//
function createDirectory(dir) {
  return new Promise( function(resolve, reject) {
    fs.ensureDir(dir, config.cmode, function (err) {
      if (err) {
        reject({ 'message': "Error creating directory", 'err': err});
      } else {
        resolve()
      }
    });
  })
}

//
// Delete a directory
//
function deleteDirectory(dir) {
  return new Promise( function(resolve, reject) {
      // Remove file or directory
    fs.remove(dir, function (err) {
        if (err) {
          reject({ 'message': "Error removing entry.", 'err': err });
        } else {
          resolve()
        }
    });
  });
}

//
// Empty a directory
//
function emptyDirectory(dir) {
  return new Promise( function(resolve, reject) {
      // Remove file or directory
    fs.emptyDir(dir, function (err) {
        if (err) {
          reject({ 'message': "Error emptying entry.", 'err': err });
        } else {
          resolve()
        }
    });
  });
}


// Set the derived parameters for all methods
//
router.all(/^(.*)$/, function(req, res, next) {
  req.absolutePath = config.baseDirectory + req.originalUrl
  next()
});

//
// GET a directory tree
//
router.get(/^(.*)$/, function(req, res, next) {
  var url = (req.secure) ? 'https' : 'http' + '://' + req.headers.host + req.originalBaseUrl
  var tree = dirTree(url, config.baseDirectory, req.originalUrl);
  common.resSuccess(tree, res);
});

//
// DELETE a directory
//
router.delete(/^(.*)$/, function(req, res, next) {
  checkExistence(req.absolutePath)
  .then(function() {
    if (req.originalUrl == '/') {
      return emptyDirectory(req.absolutePath)
    } else {
      return deleteDirectory(req.absolutePath)
    }
  })
  .then(function() {
    common.resSuccess({ 'message': 'Deleted.' }, res);
  })
  .catch(function (reason) {
    common.resError(reason.message, reason.err, res);
  })
});

//
// PUT or POST a new directory
//
router.all(/^(.*)$/, function(req, res) {
  if (req.method === 'PUT' || req.method === 'POST') {
    checkNegativeExistence(req.absolutePath)
    .then(function() {
      return createDirectory(req.absolutePath)
    })
    .then(function() {
      var response = {}
      response.url = (req.secure) ? 'https' : 'http' + '://' + req.headers.host + req.originalBaseUrl + req.url
      common.resSuccess(response, res);
    })
    .catch(function (reason) {
      common.resError(reason.message, reason.err, res);
    })
  }
});

module.exports = router;
