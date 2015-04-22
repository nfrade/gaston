var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , mime = require('mime')
  , express = require('express')
  , ServeIndex = require('serve-index')
  , ServeStatic = require('serve-static')
  , GrowingFile = require('growing-file')
  , Watcher = require('./watcher')
  , Bundler = require('../bundler')
  , DEFAULT_PORT = 8080

var Server = module.exports = {
  server: undefined,
  inited: false,
  initialPath: undefined,
  init: function(opts){
    if(this.inited){
      return;
    }

    this.options = opts || {};
    this.server = express();

    this.port = this.options.port || DEFAULT_PORT;
    this.initialPath = this.options.path || process.cwd();
    this.onServerStart = this.options.onServerStart || function(){};
    this.onServerStop = this.options.onServerStop || function(){};
    var serveIndex = ServeIndex( this.initialPath, {icons: true} )
      , serveStatic = ServeStatic( process.cwd(), {
        maxAge: '0d',
        setHeaders: setCustomCacheControl
      } )
      , watcher = Watcher.middleware(this.initialPath);

    this.server.use( watcher );
    this.server.use(serveIndex);

    this.server.get('*', function(req, res){
      var url = req.url; 
      var fullPath = path.join(Server.initialPath, url);
      res.setHeader("content-type", mime.lookup(fullPath) );

      Bundler.compilerPromise.then(function(){
        var rStream = fs.createReadStream(fullPath);
        rStream.pipe(res);
      });

    });

    this.inited = true;
  },
  start: function(opts){
    !this.inited && this.init.apply(this, arguments);
    this.server.listen( this.port, onServerStart );
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
    log.info('server is listening on port ', Server.port);
    Server.onServerStart();
};

