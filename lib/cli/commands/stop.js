var log = require('npmlog')
  , gaston = require('../../');

var stop = module.exports = function stop(args){
  return gaston.stop(args)
    .then(function(){
      log.info('gaston', 'http server stopped');
    });
};