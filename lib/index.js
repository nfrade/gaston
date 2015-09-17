var client = require('./io-client.js');

client.connectedPromise = client.connect();

var gaston = module.exports = {
  info: require('./api/info').bind(client),
  config: require('./api/config').bind(client),
  restore: require('./api/restore').bind(client),
  bundle: require('./api/bundle').bind(client),
  build: require('./api/build').bind(client),
  restart: require('./api/restart').bind(client)
};
