var log = require('npmlog')
  , Promise = require('bluebird')
  , config = require('../../../config.json')

var start = module.exports = function start(io, args){
  return new Promise(function(fulfill, reject){
    var options = {
      basePath: process.cwd(),
      port: args.port || args.p || config['http-port']
    };

    io.socket.on('started', function(server){ 
      log.info('gaston', 'http server listening on port', server.port);
      fulfill();
    });

    io.socket.on('errored', function(err){
      reject(err);
    });
    
    io.socket.emit('start', options);
  });
};