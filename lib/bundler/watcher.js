var log = require('npmlog')
  , chokidar = require('chokidar')
  , fs = require('graceful-fs')
  , denodeify = require('denodeify')
  , _ = require('lodash')
  , readFile = denodeify( fs.readFile )
  , path = require('path')
  , config = require('../config')
  , onFileChange = require('on-file-change')
  , SocketServer = require('../server/socket-server')
  , Server = require('../server')
  , moduleRegExp = /(.*)?node_modules\//
  , WATCHED_TYPES = ['.js', '.json', '.css', '.less', '.sass', '.scss']
  , Bundler;

var Watcher = module.exports = {
  initialPath: undefined,
  fullPath: undefined,
  watchify: undefined,
  compiledDir: undefined,
  globalWatcher: undefined,
  firstCompile: true,
  watchedFiles: [],
  watchers: [],

  updateWatchers: function(blessify){
    // required less files
    for(var i = 0, l = blessify.input.length; i < l; i++){
      addWatcher( blessify.input[i].src );
    }
    // css imports
    for(var i = 0, l = blessify.imports.length; i < l; i++){
      addWatcher( blessify.imports[i] );
    }
    //js files
    for(var i = 0, l = blessify.jsFiles.length; i < l; i++){
      addWatcher( blessify.jsFiles[i] );
    }
    setTimeout(function(){
      Watcher.firstCompile = false;
    }, 500);
  },

  killWatchers: function(){
    Watcher.firstCompile = true;
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
    watcher.on( 'add', watcherHandler('added') );
    watcher.on( 'change', watcherHandler('changed') );
    Watcher.watchers.push( watcher );
  }
}

var watcherHandler = function(changeType){
  return function(file){ 
    if( Watcher.firstCompile || ~file.indexOf('bundle') || config.isBuilding ){
      return;
    }
    if( ~WATCHED_TYPES.indexOf( path.extname(file) ) ){
      SocketServer.broadcast('server-message', { type: 'file-changed', file: file} );
      log.info('watcher', changeType, file);
      browserReload();
      Bundler.compile()
        .then(Watcher.updateWatchers);
    }
  };
};

var browserReload = function(){
  if(!config.noAutoReload){
    SocketServer.reloadClients();
  }
};