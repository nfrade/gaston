var path = require('path')
var fs = require('vigour-fs-promised')
var url = require('url')

module.exports = function (req, res, next) {
  var Config = global.Config
  var parsedUrl = url.parse(req.url, true)

  if (req.url !== '/' || parsedUrl.query.$findProject === 'true') {
    return next()
  }

  var dashboardIndex = path.join(__dirname, 'dashboard', 'index.html')
  return fs.createReadStream(dashboardIndex)
    .pipe(res)
}
