var log = require('npmlog')
  , fs = require('graceful-fs')
  , Promise = require('promise')
  , path = require('path')
  , mime = require('mime')
  , express = require('express')
  , ServeIndex = require('serve-index')
  , ServeStatic = require('serve-static')
  , Watcher = require('./watcher')
  , Bundler = require('../bundler')
  , backtrackFile = require('../utils/backtrack-file')
  , DEFAULT_PORT = 8080
  , socketServer = require('./socket-server')
  , localIpPromise;

var Server = module.exports = {
  server: undefined,
  inited: false,
  listening: false,
  initialPath: undefined,
  init: function(opts){
    if(this.inited){
      return;
    }

    Server.options = opts || {};
    Server.server = express();

    Server.port = Server.options.port || DEFAULT_PORT;
    Server.initialPath = Server.options.path || process.cwd();
    Server.onServerStart = Server.options.onServerStart || function(){};
    Server.onServerStop = Server.options.onServerStop || function(){};
    Server.autoreload = (Server.options.autoreload !== false)? true : false;

    var serveIndex = ServeIndex( Server.initialPath, {icons: true, view: 'tiles', trailingSlashes: true} )
      , serveStatic = ServeStatic( process.cwd(), {
        maxAge: '0d',
        setHeaders: setCustomCacheControl
      } )
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

function setCustomCacheControl(res, path) {
  var paths = ['text/html', 'text/css', 'text/js'];
  if ( ~paths.indexOf( ServeStatic.mime.lookup(path) ) ) {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'public, max-age=0');
  }
}


var onServerStart = function(){
    log.info('server', 'server is listening on port ', Server.port);
    if(Server.autoreload){
      socketServer.reloadBrowser();
    }
    Server.onServerStart();
};

//resolve server IP
(function(){
  localIpPromise = new Promise(function(fulfill, reject){
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
      fulfill(add);
    });
  });
})();

