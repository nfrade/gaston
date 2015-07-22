var config = require('../config')
  , log = require('npmlog')
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
  init: function(options){
    if(this.inited){
      return;
    }
    options = options || {};
    Server.isTesting = options.isTesting;
    Server.serverIP = ip.address();
    Server.server = express();

    var middleware = Middleware(Server);
    var serveIndex = ServeIndex( config.basePath, {
      icons: true, 
      view: 'details', 
      trailingSlashes: true
    } );

    setupStaticFiles();

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
  start: function(options){
    return new Promise(function(fulfill, reject){
      Server.init(options);

      var onServerStart = function(){
        log.info('server', 'server is listening on port ', config.port);
        log.info('server', 'server address is', Server.serverIP );
        Server.port = config.port;
        fulfill();
      };

      process.on('uncaughtException', function(ex){
        if(ex.code === 'EADDRINUSE'){
          Server.server.listen(++config.port, onServerStart);
        }
      });

      Server.server.listen(config.port, onServerStart);

      //startHTTPSserver();
    });

  }, 
  launch: function(path){
    var address = 'http://' + Server.serverIP + ':' + config.port + '/';
    if(Server.isTesting){
      address += 'test/';
    }
    log.info('server', 'launching browser at', address);
    openurl.open( address + (path || '') );
  }
};

var startHTTPSserver = function(){
  var gastonBasePath = path.join(__dirname, '../..');
      
      var credentials = {
        key: fs.readFileSync( path.join(gastonBasePath, 'gaston.key'), 'utf8' ),
        cert: fs.readFileSync( path.join(gastonBasePath, 'gaston.crt'), 'utf8' )
      };

      https.createServer(credentials, Server.server).listen(8443, function(){
        log.info('server', 'https server listening on port', 8443);
      });
};

var setupStaticFiles = function(){
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
}
