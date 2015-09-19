var client = require('./io-client.js');

var gaston = module.exports = {
  info: require('./api/info').bind(client),
  config: require('./api/config').bind(client),
  restore: require('./api/restore').bind(client),
  bundle: require('./api/bundle').bind(client),
  build: require('./api/build').bind(client),
  restart: require('./api/restart').bind(client)
};

if(typeof window === 'undefined'){
  var config = Config.get();
  var server = {
    ip: config.ip,
    port: config['api-port']
  };

  client.connectedPromise = client.connect(server);  
}
