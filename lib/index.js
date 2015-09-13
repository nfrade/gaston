var client = require('./io-client.js')
  , daemon = require('./daemon');

client.connectedPromise = client.connect();

var gaston = module.exports = {
  info: require('./api/info').bind(client),
  config: require('./api/config').bind(client),
  bundle: require('./api/bundle').bind(client),
  restart: require('./api/restart').bind(client)
};
