var client = require('./io-client.js')
  , isNode = typeof window === 'undefined';

var gaston = module.exports = {
  info: require('./api/info').bind(client),
  bundle: require('./api/bundle').bind(client),
  build: require('./api/build').bind(client),
  restart: require('./api/restart').bind(client)
};
