module.exports = function start(options){
  var client = this;
  return client.connectedPromise || client.connect()
    .then(function(){
      return new Promise(function(resolve, reject){

        client.socket.on('config-info', function(data){
          data.ev = 'config-info';
          resolve(data);
        });

        client.socket.on('configured', function(data){
          data.ev = 'configured';
          resolve(data);
        });

        client.socket.on('errored', reject);

        client.socket.emit('config', options);

      });
  });
};