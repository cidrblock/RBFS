var express = require('express')
var router = express.Router();
var fs = require('fs-extra');
var common = require('./lib/common')
var mime = require('mime')
var filesize = require('filesize');
var md5File = require('md5-file');
var CustomError = require('./lib/custom-error');

//
// Check for the existence of a file
//
function checkExistence (file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, data) => {
      if (err) {
        resolve('created')
      } else {
        resolve('updated')
      }
    })
  })
}

//
// Save a file
//
function saveFile(req) {
  return new Promise( function(resolve, reject) {
    if (req.files && req.files.file) {
      fs.rename(req.files.file.path, req.absolutePath, function (err) {
      // fs.outputFile(req.absolutePath, req.files.filedata.data, function (err) {
        if (err) {
          reject({'message': "Error writing temporary file.", 'err': err });
        } else {
          resolve()
        }
      });
    } else {
      var msg= 'Error retrieving file from payload.'
      reject({'message': msg , 'err': null});
    }
  })
}

//
// Retrieve and return the MD5 hash for a file
//
function getMD5(req) {
  return new Promise( function(resolve, reject) {
    md5File(req.absolutePath, function (err, hash) {
      if (err) {
        var msg = 'Error calculating MD5 for file.'
        reject({ 'message': msg, 'err': null });
      } else {
        resolve(hash)
      }
    })
  })
}

//
// Delete a file by name
//
function deleteFile(fileName) {
  return new Promise( function(resolve, reject) {
    fs.unlink(fileName, function(err) {
      if (err) {
        var msg = 'Error deleting file.'
        reject({ 'message': msg, 'err': null });
      } else {
        resolve()
      }
    })
  })
}

//
// Source IP Address
//
function getSourceIP(req) {
  ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7)
  }
  return(ip)
}

//
// Reverse DNS lookup
//
function resolveSourceIP(ip) {
  return new Promise( function(resolve, reject) {
    var dns = require('dns')
    dns.setServers(settings.dnsServers);
    dns.reverse(ip, function(err, domains) {
      if (err) {
        resolve()
      } else {
        resolve(domains)
      }
    })
  })
}

//
// Retrieve contents of history file
//
function retrieveFileHistory(req) {
  return new Promise( function(resolve, reject) {
    var historyFile = req.absolutePath + settings.historyExtention
    var history = []
    fs.readFile(historyFile,  'utf8', function (err, data) {
      if (!err) {
        try {
          history = JSON.parse(data)
        } catch (err) {
          reject({ 'message': "Error parsing history file.", 'err': err});
        }
      }
      resolve({'historyFileName': historyFile, 'history': history})
    })
  })
}

//
// Get the stats for a file
//
function getFileStat(req) {
  return new Promise( function(resolve, reject) {
    fs.stat(req.absolutePath, function(err, stat) {
      if (err) {
        reject({ 'message': "Error opening file during history update.", 'err': err});
      } else {
        resolve(stat)
      }
    })
  })
}

//
// Update the history file for a file
//
function updateFileHistory(details, req) {
  return new Promise( function(resolve, reject) {
    var entry = {}
    entry.action = details.action;
    entry.size = details.fileStat.size;
    entry.humanSize = filesize(details.fileStat.size);
    entry.md5 = details.md5
    entry.md5ValidationRequested = details.md5ValidationRequested
    entry.md5Validated = details.md5Validated
    entry.modified = new Date(details.fileStat.mtime.getTime()).toISOString();
    entry.sourceIP = details.sourceIP
    if (details.dnsName) {
      entry.sourceDNSName = details.dnsName.join(',')
    } else {
      entry.sourceDNSName = 'unknown'
    }
    entry.userData = req.fields
    details.history.push(entry)
    fs.writeFile(details.historyFileName, JSON.stringify(details.history),  'utf8', function(err) {
      if(err) {
        reject({ 'message': "Error updating file history.", 'err': err});
      } else {
        resolve()
      }
    })
  })
}


//
// Set the derived parameters for all methods
//
router.all(/^(.*)$/, function(req, res, next) {
  req.absolutePath = settings.baseDirectory + req.originalUrl
  next()
});


//
// GET a file
//
router.get(/^(.*)$/, function(req, res) {
  fs.readFile(req.absolutePath, function (err, data) {
    if (err) {
        common.resError("Error: Filed to read requested file.", err, res);
    } else {
        // Set the mimetype based on the extention
        var mimeType = mime.lookup(req.absolutePath);
        res.writeHead(200, {
          'Content-Type': mimeType,
        });
        res.end(data);
    }
  });
});

//
// DELETE a file
//
router.delete(/^(.*)$/, function(req, res) {
  deleteFile(req.absolutePath)
  .then(function() {
    return deleteFile(req.absolutePath + settings.historyExtention)
  })
  .then(function() {
    var response = {}
    common.resSuccess('File and history deleted.', res);
  })
  .catch(function (reason) {
    common.resError(reason.message, reason.err, res);
  })
});

//
// POST OR PUT a file
//

router.all(/^(.*)$/, function(req, res, next) {
  if (req.method === 'PUT' || req.method === 'POST') {
    var details = {}
    details.sourceIP = getSourceIP(req)
    checkExistence(req.absolutePath)
    .then(function(result) {
      details.action = result
      return saveFile(req)
    })
    .then(function() {
      return getMD5(req)
    })
    .then(function(result) {
      details.md5 = result
      details.md5ValidationRequested = false
      details.md5Validated = false
      if (req.fields && req.fields.md5) {
        details.md5ValidationRequested = true
      }
      if (req.fields && req.fields.md5 && req.fields.md5 === details.md5) {
        details.md5Validated = true
      }
      if (req.fields && req.fields.md5 && req.fields.md5 != details.md5) {
        return deleteFile(req.absolutePath)
          .then(function() {
            var msg = 'Error file was corrupted. MD5 not matching after file save. file deleted'
            throw new CustomError(msg);
          })
        }
    })
    .then(function() {
      return resolveSourceIP(details.sourceIP)
    })
    .then(function(result) {
      details.dnsName = result
      return retrieveFileHistory(req)
    })
    .then(function(result) {
      details.historyFileName = result.historyFileName
      details.history = result.history
      return getFileStat(req)
    })
    .then(function(result) {
      details.fileStat = result
      return updateFileHistory(details, req)
    })
    .then(function() {
      var response = {}
      response.url = (req.secure) ? 'https' : 'http' + '://' + req.headers.host +  req.originalBaseUrl + req.url
      response.history = (req.secure) ? 'https' : 'http' + '://' + req.headers.host +  req.originalBaseUrl + '/history' + req.url
      response.md5 = details.md5
      common.resSuccess(response, res);
    })
    .catch(function (reason) {
      common.resError(reason.message, reason.err, res);
    })
  }
});

module.exports = router;
