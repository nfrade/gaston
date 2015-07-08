var log = require('npmlog')
  , npm = require('npm')
  , fs = require('graceful-fs')
  , path = require('path')
  , gaston = require('../gaston')
  , config = require('../config')
  , Bundler = require('../bundler')
  , stdin = process.openStdin()
  , npmLoaded;

module.exports = function(){
  gaston.test()
    .then(function(){ stdin.on('data', stdinListener) })
    .catch( function(err){ log.error('gaston test', err); } );

    npmLoaded = npm.loadAsync();
};

var stdinListener = function(chunk) {
  if(gaston.isCompiling){
    return;
  }
  var brokeApart = chunk.toString().replace('\n', '').split(' ');
  command = brokeApart.splice(0, 1).shift();

  switch(command){
    default: 
      log.error('command "', command, '"not recognized. Type "help" for help');
      break;
  }
};

var helpPromise = fs.readFileAsync( path.join(__dirname, '../../help', 'in-dev.txt'), 'utf8' );
