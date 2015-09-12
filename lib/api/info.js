var info = module.exports = function info(options){
  var client = this;
  return client.connectedPromise
    .then(function(){
      return new Promise(function(resolve, reject){
        client.socket.on('info-complete', resolve);
        client.socket.on('errored', reject);
        
        client.socket.emit('info', options);
      });
  });
};