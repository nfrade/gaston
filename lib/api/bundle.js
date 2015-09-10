module.exports = function start(options){
  var client = this;
  return new Promise(function(resolve, reject){
    return client.connectedPromise
      .then(function(){
        client.socket.on('bundled', function(message){
          resolve();
        });

        client.socket.on('errored', function(err){
          reject(err);
        });

        client.socket.emit('bundle', options);
      });
  });
};