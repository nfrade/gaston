var log = require('npmlog');

var stop = module.exports = function stop(io, args){
  return new Promise(function(fulfill, reject){
    io.socket.on('stopped', function(server){ 
      log.info('gaston', 'http server stopped');
      fulfill();
    });

    io.socket.on('errored', function(err){
      reject(err);
    });
    
    io.socket.emit('stop');
  });
};