var express = require('express')
var router = express.Router()

router.use('/history', require('./history'))
router.use('/md5', require('./md5'))

router.use(function(req, res, next){
  req.originalUrl = req.url
  req.originalBaseUrl = req.baseUrl
  if (req.url.endsWith('/')) {
    req.url = '/directory' + req.url
  } else {
    req.url = '/file' + req.url
  }
  next()
});

router.use('/file', require('./file'))
router.use('/directory', require('./directory'))

module.exports = router
