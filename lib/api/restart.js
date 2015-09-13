var restart = module.exports = function restart(options){
  var client = this;
  return client.connectedPromise
    .then(function(){
      return new Promise(function(resolve, reject){
        client.socket.on('restart-complete', resolve);
        client.socket.on('errored', reject);
        
        client.socket.emit('restart', options);
      });
  });
};