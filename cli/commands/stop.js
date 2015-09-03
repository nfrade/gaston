var log = require('npmlog')
  , config = require('../../config.json')

var stop = module.exports = function stop(io, args){
  return new Promise(function(fulfill, reject){
    io.socket.on('stopped', function(server){ 
      log.info('gaston', 'http server stopped');
      fulfill();
    });
    
    io.socket.emit('stop');
  });
};