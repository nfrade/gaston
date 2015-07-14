var log = require('npmlog')
  , npm = require('npm')
  , fs = require('graceful-fs')
  , path = require('path')
  , gaston = require('../gaston')
  , config = require('../config')
  , Bundler = require('../bundler')
  , Tracker = require('../tracker')
  , stdin = process.openStdin()
  , npmLoaded;

module.exports = function(){
  gaston.dev()
    .then(function(){ stdin.on('data', stdinListener) })
    .catch( function(err){ log.error('gaston dev', err); } );

    npmLoaded = npm.loadAsync();
};

var stdinListener = function(chunk) {
  if(gaston.isCompiling){
    return;
  }
  var brokeApart = chunk.toString().replace('\n', '').split(' ');
  command = brokeApart.splice(0, 1).shift();

  switch(command){
    case 'npm':
      var subCommand = brokeApart.splice(0, 1);
      npmLoaded
        .then(function(npm){
          npm.commands['run-script'](subCommand)
        })
      break;
    case 'help':
      helpPromise.then( function(data){ console.log(data); } );
      break;
    case 'build':
      gaston.isCompiling = true;
      gaston.build()
        .then(function(){
          gaston.isCompiling = false;
          Bundler.isBuilding = false;
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
    case 'p':
      Tracker.toggle();
      break;
    default: 
      log.error('command "', command, '"not recognized. Type "help" for help');
      break;
  }
};

var helpPromise = fs.readFileAsync( path.join(__dirname, '../../help', 'in-dev.txt'), 'utf8' );
