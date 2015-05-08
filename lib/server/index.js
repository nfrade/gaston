var log = require('npmlog')
  , fs = require('graceful-fs')
  , Promise = require('promise')
  , path = require('path')
  , express = require('express')
  , openurl = require('openurl')
  , ServeIndex = require('serve-index')
  , Watcher = require('./watcher')
  , Bundler = require('../bundler')
  , backtrackFile = require('../utils/backtrack-file')
  , DEFAULT_PORT = 8080
  , socketServer = require('./socket-server')
  , localIpPromise;

var Server = module.exports = {
  server: undefined,
  port: undefined,
  inited: false,
  listening: false,
  initialPath: undefined,
  injectPackage: undefined,
  init: function(opts){
    if(this.inited){
      return;
    }

    Server.options = opts || {};
    Server.server = express();

    Server.port = Server.options.port || DEFAULT_PORT;
    Server.initialPath = Server.options.path || process.cwd();
    Server.injectPackage = Server.options.injectPackage;
    Server.onServerStart = Server.options.onServerStart || function(){};
    Server.onServerStop = Server.options.onServerStop || function(){};
    Server.autoreload = (Server.options.autoreload !== false)? true : false;

    var serveIndex = ServeIndex( Server.initialPath, {icons: true, view: 'tiles', trailingSlashes: true} )
      , watcher = Watcher.middleware(Server)

    Server.server.get('/socket-port', function(req, res){
      localIpPromise
        .then(function(serverIP){
          res.status(200).json({
            port: socketServer.port,
            ip: serverIP
          });
        });
    });

    Server.server.use( watcher );
    Server.server.use( serveIndex );

    Server.inited = true;
  },
  start: function(opts){
    !Server.inited && Server.init.apply(Server, arguments);
    Server.server.listen( Server.port, onServerStart );
  }
};

var onServerStart = function(){
    log.info('server', 'server is listening on port ', Server.port);
    if(Server.autoreload){
      socketServer.reloadBrowser();
    }
    openurl.open('http://localhost:' + Server.port);
    Server.onServerStart();
};

