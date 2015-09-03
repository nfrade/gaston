var log = require('npmlog')
  , config = require('../../config.json')

var start = module.exports = function(io, args){
  return new Promise(function(fulfill, reject){
    var options = {
      basePath: process.cwd(),
      port: args.port || args.p || config['http-port']
    };

    io.socket.on('started', function(server){ 
      log.info('gaston', 'http server listening on port', server.port);
      fulfill();
    });
    
    io.socket.emit('start', options);
  });
};