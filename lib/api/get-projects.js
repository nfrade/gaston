// var client = require('../io-client.js')

var getProjects = module.exports = function () {
  var client = this
  return new Promise(function (resolve, reject) {
    client.socket.on('get-projects', function (projects) {
      resolve(projects)
    })

    console.log('emiting first')
    client.socket.emit('get-projects')
  })
}
