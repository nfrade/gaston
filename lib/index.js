var log = require('npmlog')
  , client = require('./io-client.js');

client.connect();

var gaston = module.exports = {
  start: function(options){
    return run(function(resolve, reject){
      client.socket.on('started', function(server){ 
        log.info('gaston', 'http server listening on port', server.port);
        resolve();
      });

      client.socket.on('errored', function(err){
        reject(err);
      });
      client.socket.emit('start', options);
    });
  },

  stop: function(options){
    return run(function(resolve, reject){
      client.socket.on('stopped', function(server){ 
        log.info('gaston', 'http server stopped');
        resolve();
      });

      client.socket.on('errored', function(err){
        reject(err);
      });
      
      client.socket.emit('stop');
    });
  },

  config: function(options){
    return run(function(resolve, reject){ 
      client.socket.on('configured', function(message){
        log.info( 'config', message );
        resolve();
      });

      client.socket.on('errored', function(message){
        log.error('config', message.replace('error: ', '') );
        resolve();
      });

      client.socket.emit('config', options);
    });
  },

  bundle: function(options){
    return run(function(resolve, reject){

      client.socket.on('bundled', function(message){
        resolve();
      });

      client.on('errored', function(err){
        reject(err);
      })

    });
  }
}

var run = function run(what){
  return client.connected
    .then(function(){
      return new Promise(what);
    })
}