var Bundler = module.exports = function (app) {
  this.app = app
}

Bundler.prototype.bundle = require('./bundle')
Bundler.prototype.build = require('./build')
