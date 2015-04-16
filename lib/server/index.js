var log = require('npmlog')
  , express = require('express')
  , ServeIndex = require('serve-index')
  , ServeStatic = require('serve-static')
  , Watcher = require('./watcher')
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
      , serveStatic = ServeStatic( process.cwd() )
      , watcher = Watcher.middleware(this.initialPath);

    this.server.use( watcher );
    this.server.use(serveIndex);
    this.server.use(serveStatic);
    this.inited = true;
  },
  start: function(opts){
    !this.inited && this.init.apply(this, arguments);
    this.server.listen( this.port, onServerStart );
  }
};


var onServerStart = function(){
    log.info('server is listening on port ', Server.port);
    Server.onServerStart();
};

