var daemon = require('../');

var stop = module.exports = function stop(options){ console.log('here')
  var socket = this;
  return daemon.stop()
    .then(function(){
      socket.emit('stopped', httpServer);
    })
    .catch(function(err){
      socket.emit('errored', err.message)
    });
};