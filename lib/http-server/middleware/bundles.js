var path = require('path')
var url = require('url')
var mime = require('mime')

module.exports = function (req, res, next) {
  var Config = global.Config
  if (~req.url.indexOf('bundle.')) {
    var parsedUrl = url.parse(req.url, true)
    var query = parsedUrl.query
    var pathname = parsedUrl.pathname
    var appName = query.$app
    var ext = path.extname(pathname).substr(1)
    var app = Config.apps[appName]
    var mimeType = mime.lookup(pathname)
    res.set({'Content-Type': mimeType})
    return res.send(app.bundle[ext])
  }
  next()
}
