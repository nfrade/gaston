var aliasify = require('aliasify')
var _ = require('lodash')
var path = require('path')

module.exports = function setAlias (b, app) {
  if (!app.project) {
    return
  }
  var basePath = app.project['base-path']

  var aliases = {}
  aliases[app.title] = basePath
  aliases['~'] = basePath

  var requirePaths = app.gaston.aliasify
  if (requirePaths) {
    aliases = _.extend(aliases, requirePaths, function (v, o) {
      return path.join(basePath, o)
    })
  }

  b.transform(aliasify, {
    aliases: aliases,
    verbose: false
  })
}
