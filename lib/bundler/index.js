
var Bundler = module.exports = function(options){
  this.options = options;
};

Bundler.prototype.bundle = require('./bundle');
Bundler.prototype.build = require('./build');
