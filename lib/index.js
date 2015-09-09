var log = require('npmlog')
  , client = require('./io-client.js');

client.connect();

var gaston = module.exports = {
  start: function(options){
    return run(function(fulfill, reject){
      client.socket.on('started', function(server){ 
        log.info('gaston', 'http server listening on port', server.port);
        fulfill();
      });

      client.socket.on('errored', function(err){
        reject(err);
      });
      client.socket.emit('start', options);
    });
  },

  stop: function(options){
    return run(function(fulfill, reject){
      client.socket.on('stopped', function(server){ 
        log.info('gaston', 'http server stopped');
        fulfill();
      });

      client.socket.on('errored', function(err){
        reject(err);
      });
      
      client.socket.emit('stop');
    });
  },

  config: function(options){
    return run(function(fulfill, reject){ 
      client.socket.on('configured', function(message){
        log.info( 'config', message );
        fulfill();
      });

      client.socket.on('errored', function(message){
        log.error('config', message.replace('error: ', '') );
        fulfill();
      });

      client.socket.emit('config', options);
    });
  }
}

var run = function run(what){
  return client.connected
    .then(function(){
      return new Promise(what);
    })
}