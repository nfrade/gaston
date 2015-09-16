var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , chokidar = require('chokidar')
  , _ = require('lodash')
  , path = require('path')
  , moduleRegExp = /(.*)?node_modules\//
  , WATCHED_TYPES = ['.js', '.json', '.css', '.less', '.sass', '.scss']

var Watcher = module.exports = {

  updateFromBundler: function(bundler){
    console.log('in updateFromBundler')
  }
};

var WatcherOld = {
  initialPath: undefined,
  fullPath: undefined,
  watchify: undefined,
  compiledDir: undefined,
  globalWatcher: undefined,
  firstCompile: true,
  watchedFiles: [],
  watchers: [],

  updateWatchers: function(dirPath, blessify){
    dirPath = dirPath.replace(config.basePath, '/');
    var compiles = blessify.compiles[dirPath];

    // required less files
    if(compiles.input) {
      for(var i = 0, l = compiles.input.length; i < l; i++){
        addWatcher( compiles.input[i].src );
      }
    } else {
      log.warn('no required less files (blessify.input) from server/watcher.js');
    }
    // css imports
    
    if(compiles.imports) {
      for(var i = 0, l = compiles.imports.length; i < l; i++){
        addWatcher( compiles.imports[i] );
      }
    } else {
      log.warn('cannot find blessify.imports from server/watcher.js');
    }

    if(compiles.jsFiles) {
      //js files
      for(var i = 0, l = compiles.jsFiles.length; i < l; i++){
        addWatcher( compiles.jsFiles[i] );
      }
    } else {
      log.error('cannot find blessify.jsFiles from server/watcher.js');
    }

  },

  killWatchers: function(){
    Watcher.watchedFiles = [];

    for(var i = 0, l = Watcher.watchers.length; i < l; i++){
      Watcher.close();
    }
    Watcher.watchers = [];
    
    if(Watcher.watchify){
      Watcher.watchify.close();
      Watcher.watchify = null; 
      log.info('watcher', 'closed and killed watchify');
    }
    
    log.info('watcher', 'killed all watchers');
  },
  addWatcher: addWatcher
};

function addWatcher(file){
  if( !~Watcher.watchedFiles.indexOf(file) ){
    Watcher.watchedFiles.push(file);
    var watcher = chokidar.watch(file);
    watcher.on( 'change', watcherHandler('changed') );
    Watcher.watchers.push( watcher );
  }
};

var watcherHandler = function(changeType){
  return function(file){
    if( ~file.indexOf('bundle') || Bundler.isBuilding ){
      return;
    }
    if( ~WATCHED_TYPES.indexOf( path.extname(file) ) ){
      
      repo.getBranch(config.basePath)
        .then(function(branch){
          config.branch = branch;
          SocketServer.broadcast('server-message', { type: 'file-changed', file: file} );
        })
    }
  };
};

var browserReload = function(){
  if(!config.noAutoReload){ 
    SocketServer.reloadClients();
  }
};
