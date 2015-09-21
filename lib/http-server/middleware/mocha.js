var fs = require('vigour-fs-promised')
var path = require('path')
var mime = require('mime')
var mochaDir = path.join(__dirname, '../../..', 'node_modules', 'mocha')

module.exports = function mochaMiddleware (req, res, next) {
  var fileName = req.url.split('/').pop()
  if (!~fileName.indexOf('mocha.')) {
    return next()
  }

  var fileToServe = path.join(mochaDir, fileName)
  res.set({ 'Content-Type': mime.lookup(fileToServe) })
  fs.createReadStream(fileToServe)
    .pipe(res)
}
