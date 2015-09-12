var stop = module.exports = function stop(options){
  var client = this;
  return client.connectedPromise
    .then(function(){
      return new Promise(function(resolve, reject){
        client.socket.on('stopped', resolve);
        client.socket.on('errored', resolve);

        client.socket.emit('stop');
      });
    });
};