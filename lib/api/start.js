var start = module.exports = function start(options){
  var client = this;
  return client.connectedPromise
    .then(function(){
      return new Promise(function(resolve, reject){
        client.socket.on('started', resolve);
        client.socket.on('errored', reject);
        
        client.socket.emit('start', options);
      });
  });
};