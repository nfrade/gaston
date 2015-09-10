var log = require('npmlog')
  , client = require('./io-client.js');

client.connect();

var gaston = module.exports = {
  start: require('./api/start').bind(client),
  stop: require('./api/stop').bind(client),
  config: require('./api/config').bind(client),

  bundle: function(options){
    return run(function(resolve, reject){

      client.socket.on('bundled', function(message){
        resolve();
      });

      client.socket.on('errored', function(err){
        reject(err);
      });

      client.socket.emit('bundle', options);

    });
  }
}

var run = function run(what){
  return client.connectedPromise
    .then(function(){
      return new Promise(what);
    })
}