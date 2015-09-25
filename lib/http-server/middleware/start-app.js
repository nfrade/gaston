var url = require('url')

module.exports = function (req, res, next) {
  var Config = global.Config
  var parsedUrl = url.parse(req.url, true)
  var query = parsedUrl.query
  if (query.$action !== 'dev') {
    return next()
  }
  Config.get(query.$file)
    .then(function (app) {
      var project = app.project
      var server = project.server
      var appPath = app.basePath.replace(project.basePath, '')
      var redirectURL = 'http://' + server.ip + ':' + server.port
      redirectURL += '?$app=' + appPath
      res.redirect(301, redirectURL)
    })
}
