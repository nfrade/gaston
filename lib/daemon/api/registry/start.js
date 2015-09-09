var httpServer = require('../../../http-server');

var start = module.exports = function start(options){
  var socket = this; 
  return httpServer.start(options)
    .then(function(){
      socket.emit('started', httpServer);
    })
    .catch(function(err){
      socket.emit('errored', err.message);
    });
};