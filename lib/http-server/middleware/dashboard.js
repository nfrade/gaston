var path = require('path')
var fs = require('vigour-fs-promised')
var url = require('url')

module.exports = function (req, res, next) {
  var parsedUrl = url.parse(req.url, true)
  var webUiPath = path.join(__dirname, '../../../node_modules/gaston-web-ui')

  if (req.header('Referer') === 'http://' + req.headers.host + '/' ||
      req.header('Referer') === 'http://' + req.headers.host + '/build.css') {
    var staticPath
    switch (req.url) {
      case '/naked-gaston.js':
        return next()
      case '/build.css':
      case '/build.js':
        staticPath = path.join(webUiPath, 'build', req.url)
        break
      default:
        staticPath = path.join(webUiPath, req.url)
        break
    }

    var readStream = fs.createReadStream(staticPath)
    readStream.on('error', function (err) {
      console.log(err)
      res.end('File not found')
    })
    return readStream.pipe(res)
  }

  if (req.url !== '/' || parsedUrl.query.$findProject === 'true') {
    return next()
  }

  // var dashboardIndex = path.join(__dirname, 'dashboard', 'index.html')
  // var dashboardIndex = path.join(require('os').tmpdir(), 'gaston-dashboard', 'index.html')
  var dashboardIndex = path.join(webUiPath, 'build', 'index.html')
  return fs.createReadStream(dashboardIndex)
    .pipe(res)
}
