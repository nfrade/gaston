"use strict";

var fs = require('vigour-fs-promised')
var path = require('path')

module.exports = function setAlias (b, app) {
  var transforms = app.gaston.transforms
  if (!transforms) {
    return
  }

  var project = app.project
  var modulesPath = path.join(project['base-path'], 'node_modules')

  var paths = Object.keys(transforms)
  for (let i = 0, l = paths.length; i < l; i++) {
    let key = paths[i]
    let options = transforms[key]
    let transformPath = path.join(modulesPath, key)
    if (fs.existsSync(transformPath)) {
      options.branch = project.branch
      b.transform(require(transformPath), options)
    }
  }
}
