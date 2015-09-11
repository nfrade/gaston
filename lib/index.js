var client = require('./io-client.js')
  , daemon = require('./daemon');

client.connectedPromise = client.connect()
  .then(function(){
    console.log('connected')
  });

var gaston = module.exports = {
  info: require('./api/info').bind(client),
  start: require('./api/start').bind(client),
  stop: require('./api/stop').bind(client),
  config: require('./api/config').bind(client),
  bundle: require('./api/bundle').bind(client)
};
