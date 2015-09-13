var daemon = require('../');

var restore = module.exports = function restore(options){
  var socket = this;

  return daemon.restoreConfig()
    .then(function(config){
      socket.emit('restore-complete', config);
    })
    .catch(function(err){ 
      socket.emit( 'errored', err.message || err );
    });
};