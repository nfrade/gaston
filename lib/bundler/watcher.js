var log = require('npmlog')
  , fs = require('graceful-fs')
  , denodeify = require('denodeify')
  , _ = require('lodash')
  , readFile = denodeify(fs.readFile)
  , path = require('path')
  , config = require('../config')
  , onFileChange = require('on-file-change')
  , SocketServer = require('../server/socket-server')
  , Server = require('../server')
  , moduleRegExp = /(.*)?node_modules\//
  , Bundler;

var Watcher = module.exports = {
  initialPath: undefined,
  fullPath: undefined,
  watchify: undefined,
  compiledDir: undefined,
  globalWatcher: undefined,

  launch: function(fullPath){
    Bundler = Bundler || require('./');
    config.gaston = config.gaston || {};
    Watcher.compiledDir = fullPath;
    Watcher.killWatchers();
    Bundler.setup({
      path: fullPath,
      Watcher: Watcher
    });

    Bundler.globalWatcher = fs.watch(
      config.basePath, 
      { persistent: true, recursive: true }, 
      watcherHandlerGlobal
    );

    return Bundler.compile();

  },

  killWatchers: function(){
    Bundler.globalWatcher && Bundler.globalWatcher.close();
    Bundler.globalWatcher = null;
    
    if(Watcher.watchify){
      Watcher.watchify.close();
      Watcher.watchify = null; 
      log.info('watcher', 'closed and killed watchify')
    }
    
    log.info('watcher', 'killed all watchers');
  }
};

var compiledOnce = [];

var watcherHandlerGlobal = function(changeType, fileName){
  if( ~fileName.indexOf('bundle') ){
    return;
  }

  switch( path.extname(fileName) ){
    case '.js':
    case '.json':
    case '.css':
    case '.less':
      log.info('watcher', 'file changed:', fileName);
      SocketServer.broadcast('server-message', { type: 'file-changed', file: fileName} );
      //[TODO: this hack has got to go!!!]
      if(~compiledOnce.indexOf(fileName)){
        browserReload();
        Bundler.compile()
      } else {
        compiledOnce.push(fileName);
        Bundler.compile();
        setTimeout(function(){
          browserReload();
          Bundler.compile();
        }, 500);
      }
      break;
  }
};

var browserReload = function(){
  if(!config.noAutoReload){
    SocketServer.reloadClients();
  }
};