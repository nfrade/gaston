var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , mime = require('mime')
  , express = require('express')
  , ServeIndex = require('serve-index')
  , ServeStatic = require('serve-static')
  , Watcher = require('./watcher')
  , Bundler = require('../bundler')
  , backtrackFile = require('../utils/backtrack-file')
  , DEFAULT_PORT = 8080


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
    var serveIndex = ServeIndex( Server.initialPath, {icons: true, view: 'tiles'} )
      , serveStatic = ServeStatic( process.cwd(), {
        maxAge: '0d',
        setHeaders: setCustomCacheControl
      } )
      , watcher = Watcher.middleware(Server.initialPath);

    Server.server.use( watcher );
    Server.server.use(serveIndex);

    Server.server.get('*', function(req, res){
      var url = req.url; 
      var fullPath = path.join(Server.initialPath, url);
      fs.exists(fullPath, function(exists){
        if(!exists){
          return res.status(404).send(fullPath + 'not found');
        }
        var mimeType = mime.lookup(fullPath);
        res.setHeader("content-type", mimeType );

        Bundler.compilerPromise.then(function(){
          var rStream = fs.createReadStream(fullPath);
          rStream.pipe(res);
        });
      });
    });

    Server.inited = true;
  },
  start: function(opts){
    !Server.inited && Server.init.apply(Server, arguments);
    Server.server.listen( Server.port, onServerStart );
  }
};

function setCustomCacheControl(res, path) {
  var paths = ['text/html', 'text/css', 'text/js']
  if ( ~paths.indexOf( ServeStatic.mime.lookup(path) ) ) {
    // Custom Cache-Control for HTML files
    res.setHeader('Cache-Control', 'public, max-age=0')
  }
}


var onServerStart = function(){
    log.info('server', 'server is listening on port ', Server.port);
    Server.onServerStart();
};

