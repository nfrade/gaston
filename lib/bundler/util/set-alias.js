var aliasify = require('aliasify')
var _ = require('lodash')
var path = require('path')
var backtrackFile = require('../../utils/backtrack-file')

module.exports = function setAlias (b, options) {
  var config = global.Config.get()
  options = options || {}
  if (options.naked) {
    return
  }

  var packagePath = options.package
  if (!packagePath) {
    var source = Array.isArray(options.source) ? options.source[1] : options.source
    packagePath = backtrackFile('package.json', path.dirname(source))
  }
  var basePath = path.dirname(packagePath)
  try {
    var pkg = require(packagePath)
    var aliases = {}
    var requirePaths = config['aliasify']
    if (requirePaths) {
      aliases = _.extend(aliases, requirePaths, function (v, o) {
        return path.join(basePath, o)
      })
    }
    aliases[pkg.name] = basePath
    aliases['~'] = basePath

    b.transform(aliasify, {
      aliases: aliases,
      verbose: false
    })
  } catch (ex) {
    return ex
  }
}
