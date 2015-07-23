var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , Promise = require('bluebird')
  , mocha = require('mocha')
  , browserify = require('browserify')
  , glob = Promise.promisify( require('glob') )
  , config;

module.exports = function(cfg){
  config = cfg;
  return glob( path.join(config.basePath, 'test', '**/index.js') )
    .then(compile)
    .then(function(bundle){
      console.log(bundle);
    });
};

var compile = function(files){
  return new Promise(function(fulfill, reject){
    var br = browserify(files);
    var b = br.bundle();
    var bPath = path.join(config.basePath, 'test', 'bundle.js');
    var wStream = fs.createWriteStream(bPath);

    b.on('error', function(err){
      log.error('gaston-tester', err);
      reject(err);
    });

    var bundle = '';
    b.on('data', function(data){
      bundle += data.toString('utf8');
    });

    b.on('end', function(){
      fulfill(bundle);
    });
  })
  
};