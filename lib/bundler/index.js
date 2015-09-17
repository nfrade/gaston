
var Bundler = module.exports = function(options){
  this.options = options;
};

Bundler.prototype.bundle = require('./bundle');
Bundler.prototype.build = require('./build');


var getBlessifyOptions = function(dirPath){
  var lOptions = (config.gaston.less && config.gaston.less.options) || {};
  return _.extend({
    global: true, 
    appName: config.pkg.name,
    basePath: config.basePath,
    dirPath: dirPath.replace(config.basePath, '/')
  }, lOptions);
};
