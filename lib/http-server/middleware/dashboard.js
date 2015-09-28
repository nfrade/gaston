var url = require('url')

module.exports = function (req, res, next) {
  var parsedUrl = url.parse(req.url, true)

  if (req.url === '/' && Object.keys(parsedUrl.query).length === 0) {
    return res.send('dashboard')
  }

  next()
}
