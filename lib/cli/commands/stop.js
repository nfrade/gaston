var log = require('npmlog');

var stop = module.exports = function stop(args, gaston){
  return gaston.stop(args)
    .then(function(){
      log.info('gaston', 'http server stopped');
    });
};