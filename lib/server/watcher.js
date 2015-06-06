var log = require('npmlog')
  , chokidar = require('chokidar')
  , _ = require('lodash')
  , path = require('path')
  , config = require('../config')
  , onFileChange = require('on-file-change')
  , SocketServer = require('../server/socket-server')
  , Server = require('../server')
  , blessify = require('blessify')
  , moduleRegExp = /(.*)?node_modules\//
  , WATCHED_TYPES = ['.js', '.json', '.css', '.less', '.sass', '.scss']
  , Bundler = require('../bundler');

var Watcher = module.exports = {
  initialPath: undefined,
  fullPath: undefined,
  watchify: undefined,
  compiledDir: undefined,
  globalWatcher: undefined,
  firstCompile: true,
  watchedFiles: [],
  watchers: [],

  updateWatchers: function(){

    // required less files
    if(blessify.input) {
      for(var i = 0, l = blessify.input.length; i < l; i++){
        addWatcher( blessify.input[i].src );
      }
    } else {
      log.warn('no required less files (blessify.input) from server/watcher.js')
    }
    // css imports
    
    if(blessify.imports) {
      for(var i = 0, l = blessify.imports.length; i < l; i++){
        addWatcher( blessify.imports[i] );
      }
    } else {
      log.warn('cannot find blessify.imports from server/watcher.js')
    }

    if(blessify.jsFiles) {
      //js files
      for(var i = 0, l = blessify.jsFiles.length; i < l; i++){
        addWatcher( blessify.jsFiles[i] );
      }
    } else {
      log.error('cannot find blessify.jsFiles from server/watcher.js')
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
  }
};

var addWatcher = function(file){
  if( !~Watcher.watchedFiles.indexOf(file) ){
    Watcher.watchedFiles.push(file);
    var watcher = chokidar.watch(file);
    watcher.on( 'change', watcherHandler('changed') );
    Watcher.watchers.push( watcher );
  }
}

var watcherHandler = function(changeType){
  return function(file){ 
    if( ~file.indexOf('bundle') || config.isBuilding ){
      return;
    }
    if( ~WATCHED_TYPES.indexOf( path.extname(file) ) ){
      SocketServer.broadcast('server-message', { type: 'file-changed', file: file} );
      log.info('watcher', changeType, file);
      
      Watcher.compiledDir = null;
      browserReload();
    }
  };
};

var browserReload = function(){
  if(!config.noAutoReload){ 
    SocketServer.reloadClients();
  }
};