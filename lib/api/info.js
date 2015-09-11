var info = module.exports = function info(options){
  var client = this;
  return new Promise(function(resolve, reject){
    return client.connectedPromise
      .then(function(){
        client.socket.on('info-complete', resolve);
        client.socket.on('errored', reject);
        
        client.socket.emit('info', options);
      });
  });
};