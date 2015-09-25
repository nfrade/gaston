module.exports = function getApp (appName, project) {
  var Config = global.Config
  var config = project.package.gaston || {}

  var app = Config.apps[appName] = {
    name: project.package.name,
    project: project.basePath,
    basePath: appName,
    options: {
      source: appName,
      gaston: true,
      package: project.pkgPath,
      'source-maps': config['source-maps'],
      transforms: config.transforms,
      'index-path': config['index-path']
    }
  }
  return app
}
