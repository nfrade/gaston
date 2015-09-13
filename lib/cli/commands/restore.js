var log = require('npmlog')
  , gaston = require('../../')
  , info = require('./info')


var restore = module.exports = function restore(args){
  return gaston.restore()
    .then(function(config){
      log.info('gaston', 'restored config to last working version');
      log.info('gaston', 'run "gaston restart" to apply');
    })
};