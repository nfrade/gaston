var log = require('npmlog')
  , path = require('path')
  , gaston = require('../../')
  , restart = require('./restart');

var config = module.exports = function config(args){

  var key = args._[1];
  var val = args._[2];

  if(key && val && ~key.indexOf('-path') ){
    if( !path.isAbsolute(val) ){
      val = path.join( process.cwd(), val );
    }
  }

  var options = {
    key: key,
    val: val
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
          log.info('gaston', 'restarting with the new settings');
          return restart()
            .catch(function(err){
              log.error('gaston config', err);
            });
      }
    })
    .catch(function(err){
      log.error('config', err);
    });
};