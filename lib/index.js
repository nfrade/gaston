var client = require('./io-client.js');

var gaston = module.exports = {
  start: require('./api/start').bind(client),
  stop: require('./api/stop').bind(client),
  config: require('./api/config').bind(client),
  bundle: require('./api/bundle').bind(client)
};

gaston.connected = client.connect()