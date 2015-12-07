var path = require('path')
var fs = require('vigour-fs-promised')
var url = require('url')

module.exports = function (req, res, next) {
  var Config = global.Config
  var parsedUrl = url.parse(req.url, true)

  if (req.url.split('/').length > 1 && req.url.split('/')[1] === 'gaston-dashboard') {
    var readStream = fs.createReadStream(path.join(require('os').tmpdir(), req.url ))
    readStream.on('error', function (err) {
      res.end('File not found')
    })
    return readStream.pipe(res)
  }

  if (req.url !== '/' || parsedUrl.query.$findProject === 'true') {
    return next()
  }

  // var dashboardIndex = path.join(__dirname, 'dashboard', 'index.html')
  var dashboardIndex = path.join(require('os').tmpdir(), 'gaston-dashboard', 'index.html')
  return fs.createReadStream(dashboardIndex)
    .pipe(res)
}
