var log = require('npmlog')
  , gaston = require('../../')
  , restart = require('./restart')

var config = module.exports = function config(args){
  var options = {
    key: args._[1],
    val: args._[2]
  };
  return gaston.config(options)
    .then(function(data){
      switch(data.ev){
        case 'config-info':
          log.info('config', 'prop', data.prop);
          console.log( JSON.stringify(data.val, null, 4) );
          break;
        case 'configured':
          log.info('config', data.prop + ' changed to ' + data.val);
          return restart(data.config);
      }
    })
    .catch(function(err){
      log.error('config', err);
    });
};