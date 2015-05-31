var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , gaston = require('../gaston')
  , config = require('../config')
  , stdin = process.openStdin();

module.exports = function(){
  gaston.dev()
    .then(function(){ stdin.on('data', stdinListener) })
    .catch( function(err){ log.error('gaston dev', err); } );
};

var stdinListener = function(chunk) {
  if(gaston.isCompiling){
    return;
  }
  command = chunk.toString().replace('\n', '');
  switch(command){
    case 'help':
      helpPromise.then( function(data){ console.log(data); } );
      break;
    case 'build':
      gaston.isCompiling = true;
      gaston.build()
        .then(function(){
          gaston.isCompiling = false;
          config.isBuilding = false;
        });
      break;
    case 'launch':
      gaston.launch();
      break;
    case 'debug':
      var Watcher = require('../bundler/watcher');
      console.log('----------- WATCHER --------');
      console.log('watchedPaths');
      console.log( Watcher.watchedPaths.sort() );
      console.log( 'compiling', Watcher.compiling);
      break;
    default: 
      log.error('command "', command, '"not recognized. Type "help" for help');
      break;
  }
};

var helpPromise = fs.readFileAsync( path.join(__dirname, '../../help', 'in-dev.txt'), 'utf8' );
