var config = require('../config')
  , log = require('npmlog')
  , fs = require('graceful-fs')
  , Promise = require('bluebird')
  , path = require('path')
  , express = require('express')
  , openurl = require('openurl')
  , ServeIndex = require('serve-index')
  , mime = require('mime')
  , Watcher = require('./watcher')
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

    Server.server.get('*/gaston-compiled.js', function(req, res){
      var gastonPath = path.join(__dirname, '../browser', 'gaston-compiled.js');
        return fs.createReadStream( gastonPath )
          .pipe(res);
    });

    Server.server.get('*', function(req, res){

      var fullUrl = req.url.split('?').shift();
      var fullPath = path.join(config.basePath, fullUrl);
      res.set( {'Content-Type': mime.lookup(fullPath) } )
      
      fs.existsAsync(fullPath)
        .then(function(exists){
          if(exists){
            if(Bundler.compilerPromise){
              Bundler.compilerPromise
                .then(function(){
                  fs.createReadStream(fullPath).pipe(res);
                });
            } else {
              fs.createReadStream(fullPath).pipe(res);
            }
          } else {
            res.status(404).send('not found');
          }
        });
    });

    Server.inited = true;
  },
  start: function(){
    return new Promise(function(fulfill, reject){
      Server.init();

      var onServerStart = function(){
        log.info('server', 'server is listening on port ', config.port);
        fulfill();
      };

      process.on('uncaughtException', function(ex){
        if(ex.code === 'EADDRINUSE'){
          Server.server.listen(++config.port, onServerStart);
        }
      });

      Server.server.listen(config.port, onServerStart);

    });

  }, 
  launch: function(){
    var address = 'http://localhost:' + config.port;
    log.info('server', 'launching browser at', address);
    openurl.open(address);
  }
};


