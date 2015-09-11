module.exports = function bundle(options){
  var client = this;
  return new Promise(function(resolve, reject){
    return client.connectedPromise
      .then(function(){
        client.socket.on('bundled', resolve);
        client.socket.on('errored', reject);

        client.socket.emit('bundle', options);
      });
  });
};