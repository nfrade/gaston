var log = require('npmlog')
  , fs = require('graceful-fs')
  , Promise = require('promise')
  , path = require('path')
  , express = require('express')
  , openurl = require('openurl')
  , ServeIndex = require('serve-index')
  , mime = require('mime')
  , Watcher = require('./watcher')
  , Bundler = require('../bundler')
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

    socketServer.start();

    Server.options = opts || {};
    Server.server = express();

    Server.port = Server.options.port || DEFAULT_PORT;
    Server.initialPath = Server.options.path || process.cwd();
    Server.injectPackage = Server.options.injectPackage;
    Server.onServerStart = Server.options.onServerStart || function(){};
    Server.onServerStop = Server.options.onServerStop || function(){};
    Server.autoreload = (Server.options.autoreload !== false)? true : false;
    Server.lazyStart = Server.options.lazyStart;

    var serveIndex = ServeIndex( Server.initialPath, {
      icons: true, 
      view: 'details', 
      trailingSlashes: true
    } )
      , watcher = Watcher.middleware(Server)

    Server.server.use( watcher );
    Server.server.use( serveIndex );

    Server.server.get('*', function(req, res){
      var fullUrl = req.url.split('?').shift();
      var fullPath = path.join(Watcher.initialPath, fullUrl);
      res.set( {'Content-Type': mime.lookup(fullPath) } )
      if(Bundler.compilerPromise){
        Bundler.compilerPromise
          .then(function(){
            fs.createReadStream(fullPath).pipe(res);
          });
      } else {
        fs.createReadStream(fullPath).pipe(res);
      }
    })

    Server.inited = true;
  },
  start: function(opts){
    !Server.inited && Server.init.apply(Server, arguments);

    process.on('uncaughtException', function(ex){
      if(ex.code === 'EADDRINUSE'){
        Server.server.listen(++Server.port, onServerStart);
      }
    });

    Server.server.listen(Server.port, onServerStart);

  }, 
  launch: function(){
    var address = 'http://localhost:' + Server.port;
    log.info('server', 'launching browser at', address);
    openurl.open(address);
  }
};

var onServerStart = function(){
    log.info('server', 'server is listening on port ', Server.port);
    if(!Server.lazyStart){
      if( socketServer.hasClients() ){
        socketServer.reloadClients();
      } else {
        if(Bundler.compilerPromise){
          return Bundler.compilerPromise.then(Server.launch)
        }
        Server.launch();
      }
    }
    Server.onServerStart();
};

