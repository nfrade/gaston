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

    var options = opts || {};
    this.server = express();
    this.port = options.port || DEFAULT_PORT;
    this.initialPath = options.path || process.cwd();
    var serveIndex = ServeIndex( this.initialPath, {icons: true} )
      , serveStatic = ServeStatic( process.cwd() )
      , watcher = Watcher(this.initialPath);

    this.server.use( watcher );
    this.server.use(serveIndex);
    this.server.use(serveStatic);
    this.inited = true;
  },
  start: function(opts, cb){
    var callback = typeof cb  === 'function'? cb : function(){};

    !this.inited && this.init();
    this.server.listen(this.port, function(){
      onServerStart();
      callback();
    });
  },
  stop: function(){
    this.server.close();
  }
}


var onServerStart = function(){
    log.info('server is listening on port ', Server.port);
}

var onServerStop = function(){
  log.info('server stopped listening ', Server.port);
}







function equalHeights() {   
  for(var i = 1; ; i++){
      elems = jQuery('.alturaIgualLinha'+i);
      if(elems.length === 0){
         break;
      }
      
    if (jQuery(window).width() > 767) {
        elems.equalHeights();
    }
    else {
      elems.css("height", "auto");
    }
  }     
}