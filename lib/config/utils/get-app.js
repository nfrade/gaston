module.exports = function getApp (appName, project) {
  var config = project.package.gaston || {}

  var app = {
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
