var config = require('../config')
  , log = require('npmlog')
  , fs = require('graceful-fs')
  , Promise = require('promise')
  , denodeify = require('denodeify')
  , path = require('path')
  , express = require('express')
  , openurl = require('openurl')
  , ServeIndex = require('serve-index')
  , mime = require('mime')
  , Watcher = require('../bundler/watcher')
  , Middleware = require('./middleware')
  , Bundler = require('../bundler')
  , socketServer = require('./socket-server')
  , localIpPromise;

var Server = module.exports = {
  server: undefined,
  port: undefined,
  inited: false,
  listening: false,
  initialPath: undefined,
  injectPackage: undefined,
  init: function(){
    if(this.inited){
      return;
    }

    Server.server = express();

    var middleware = Middleware(Server);
    var serveIndex = ServeIndex( config.basePath, {
      icons: true, 
      view: 'details', 
      trailingSlashes: true
    } );

    Server.server.use( middleware );
    Server.server.use( serveIndex );

    Server.server.get('*', function(req, res){
      var fullUrl = req.url.split('?').shift();
      var fullPath = path.join(config.basePath, fullUrl);
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
  start: function(){
    return new Promise(function(fulfill, reject){
      Server.init();

      var onServerStart = function(){
        log.info('server', 'server is listening on port ', config.port);
        if(!Server.lazyStart){
          //wait to see if there's a connection on socket-server
          setTimeout(function(){
            if( socketServer.hasClients() ){
              socketServer.reloadClients();
            } else {
              Server.launch();
            };
          }, 3000);
        }
        fulfill();
      };

      process.on('uncaughtException', function(ex){
        if(ex.code === 'EADDRINUSE'){
          Server.server.listen(++config.port, onServerStart);
        }
      });

      return socketServer.start()
        .then(function(){
          Server.server.listen(config.port, onServerStart);
        });
    });

  }, 
  launch: function(){
    var address = 'http://localhost:' + config.port;
    log.info('server', 'launching browser at', address);
    openurl.open(address);
  }
};


