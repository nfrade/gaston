var path = require('path')
var url = require('url')
var mime = require('mime')

module.exports = function (req, res, next) {
  var Config = global.Config
  if (~req.url.indexOf('bundle.')) {
    var parsedUrl = url.parse(req.url, true)
    var query = parsedUrl.query
    var pathname = parsedUrl.pathname
    var ext = path.extname(pathname).substr(1)
    var app = Config.apps[query.app]
    var mimeType = mime.lookup(pathname)
    res.set({'Content-Type': mimeType})
    res.send(app.bundle[ext])
  }
}
