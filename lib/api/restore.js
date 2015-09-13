var restore = module.exports = function restore(){
  var client = this;
  return client.connectedPromise
    .then(function(){
      return new Promise(function(resolve, reject){
        client.socket.on('restore-complete', resolve);
        client.socket.on('errored', reject);
        
        client.socket.emit('restore');
      });
  });
};