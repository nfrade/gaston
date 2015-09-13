var daemon = require('../');

var restart = module.exports = function restart(options){
  var socket = this;
  daemon.restart(options)
    .then(function(){
      socket.emit('restart-complete');
    })
    .catch(function(err){
      socket.emit('errored', err.message);
    })
};