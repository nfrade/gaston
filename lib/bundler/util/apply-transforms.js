var fs = require('vigour-fs-promised')
var path = require('path')

module.exports = function setAlias (b, app) {
  var transforms = app.gaston.transforms
  if (!transforms) {
    return
  }

  var project = app.project
  var modulesPath = path.join(project['base-path'], 'node_modules')

  for (var i = 0, l = transforms.length; i < l; i++) {
    var transform = transforms[i]
    var transformPath = path.join(modulesPath, transform.path)

    if (fs.existsSync(transformPath)) {
      transform.options.branch = project.branch
      b.transform(require(transformPath), transform.options)
    }
  }
}
