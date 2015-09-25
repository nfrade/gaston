var url = require('url')

module.exports = function (req, res, next) {
  var Config = global.Config
  var parsedUrl = url.parse(req.url, true)
  var query = parsedUrl.query
  if (query.$action !== 'project') {
    return next()
  }

  Config.registerProject(query.$file)
    .then(function (project) {
      var ip = project.ip
      var port = project['http-port']
      var redirectUrl = 'http://' + ip + ':' + port
      res.redirect(301, redirectUrl)
    })

// Config.get(query.$file)
//   .then(function (app) {
//     var project = app.project
//     var server = project.server
//     var appPath = app.basePath.replace(project.basePath, '')
//     var redirectURL = 'http://' + server.ip + ':' + server.port
//     redirectURL += '?$app=' + appPath
//     res.redirect(301, redirectURL)
// })
}
