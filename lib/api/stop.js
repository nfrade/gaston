module.exports = function start(options){
  var client = this;
  return new Promise(function(resolve, reject){
    return client.connectedPromise
      .then(function(){
        client.socket.on('stopped', resolve);
        client.socket.on('errored', resolve);
        
        client.socket.emit('stop');
      });
  });
};