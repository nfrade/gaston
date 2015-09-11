var log = require('npmlog')
  , gaston = require('../../')

var info = module.exports = function info(args){
  return gaston.info()
    .then(function(info){
      log.info('gaston', 'info:');
      log.info('ip', info.ip);
      log.info('port', info.port);
      log.info('daemon', info.daemon);
    });
};