var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , Promise = require('bluebird')
  , mkdirp = Promise.promisify( require('mkdirp') )
  , config
  , testsPath

module.exports = function(cfg){
  config = cfg;
  testsPath = path.join(config.basePath, 'test', '__ci__');
  mkdirp( testsPath )
    .then(prepareFiles);
};


var prepareFiles = function(){
  var source = path.join( __dirname, '../../', 'gaston-files', 'bootstrap', 'test.html' );
  var target = path.join( testsPath, 'index.html' );
  var test = require('./bootstrap');
  // var mochaPath = require('./test').getMochaPath();
  // console.log(getMochaPath)
  // return fs.readFileAsync(source)
  //   .then(function(data){console.log(data)
  //     //return data.replace()
  //   })
};
