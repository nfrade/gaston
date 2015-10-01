var client = require('./io-client.js')

module.exports = {
  info: require('./api/info').bind(client),
  bundle: require('./api/bundle').bind(client),
  build: require('./api/build').bind(client),
  getProjects: require('./api/projects').bind(client)
}
