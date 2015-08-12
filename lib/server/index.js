var log = require('npmlog')
  , http = require('http')
  , https = require('https')
  , fs = require('graceful-fs')
  , ip = require('ip')
  , Promise = require('bluebird')
  , path = require('path')
  , express = require('express')
  , openurl = require('openurl')
  , ServeIndex = require('serve-index')
  , mime = require('mime')
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
  init: function(config, options){
    if(this.inited){
      return;
    }
    options = options || {};
    Server.isTesting = options.isTesting;
    Server.serverIP = ip.address();
    Server.server = express();

    var middleware = Middleware(config, Server);
    var serveIndex = ServeIndex( config.basePath, {
      icons: true, 
      view: 'details', 
      trailingSlashes: true
    } );

    setupStaticFiles(config);

    Server.server.use( middleware );
    Server.server.use( serveIndex );

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
  start: function(config, options){
    return new Promise(function(fulfill, reject){
      Server.init(config, options);

      var onServerStart = function(){
        Server.port = config.port;
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
  launch: function(config, path){
    var address = 'http://' + Server.serverIP + ':' + config.port + '/';
    if(Server.isTesting){
      address += 'test/';
    }
    log.info('server', 'launching browser at', address);
    openurl.open( address + (path || '') );
  }
};

var setupStaticFiles = function(config){
  Server.server.get(['bundle*', '*/bundle*'], function(req, res, next){
    var dir = path.dirname(req.url)
    if(dir !== '/'){
      dir += '/';
    }
    var action = Middleware.running[dir];
    var fileName = req.url.replace('bundle', action).replace(/\//g, '_'); console.log(fileName)
    var served = path.join(config.basePath, 'bundles', fileName);

    fs.createReadStream( served )
      .pipe( res );
  })

  Server.server.get('*/gaston-compiled.js', function(req, res){
    var gastonPath = path.join(__dirname, '../browser', 'gaston-compiled.js');
      return fs.createReadStream( gastonPath )
        .pipe(res);
  });

  Server.server.get('*/mocha.*', function(req, res){
    var ext = path.extname(req.url);
    res.set( {'Content-Type': mime.lookup(req.url) } )
    fs.createReadStream( path.join(__dirname, '../../node_modules/mocha/mocha' + ext) )
      .pipe(res);
  });

  Server.server.get(['/run/*', '*/run/*'], function(req, res, next){
    var rex = /\/(.+)?run\/(\w+)/
    var match = rex.exec(req.url);
    if(!match){
      return next();
    }

    var runPath = match[1] || '';
    var action = match[2];
    Middleware.register(runPath, action);
    res.status(200).send('ok');
  });

  Server.server.get(['/stop-running', '*/stop-running'], function(req, res, next){
    var appPath = req.url.replace('/stop-running', '/');
    Middleware.unregister(appPath);
    res.status(200).send('ok');
  });
}
