var stop = module.exports = function stop(options){
  var client = this;
  return new Promise(function(resolve, reject){
    return client.connectedPromise
      .then(function(){//return Promise.resolve();
        client.socket.on('stopped', resolve);
        client.socket.on('errored', resolve);
        console.log('emmitting')
        client.socket.emit('stop');
      });
  });
};