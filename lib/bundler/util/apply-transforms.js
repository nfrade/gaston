var fs = require('vigour-fs-promised')
var path = require('path')

module.exports = function setAlias (b, options) {
  var transforms = options.transforms
  if (!transforms) {
    return
  }
  var project = options.project
  var modulesPath = path.join(project.basePath, 'node_modules')

  for (var i = 0, l = transforms.length; i < l; i++) {
    var transform = transforms[i]
    var transformPath = path.join(modulesPath, transform.path)
    console.log(transformPath, fs.existsSync(transformPath))
    if (fs.existsSync(transformPath)) {
      transform.options.branch = project.currentBranch
      b.transform(require(transformPath), transform.options)
    }
  }
}
