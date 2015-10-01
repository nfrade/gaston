// var client = require('../io-client.js')

var getProjects = module.exports = function () {
  var client = this
  return new Promise(function (resolve, reject) {
    client.socket.on('projects', function (projects) {
      resolve(projects)
    })

    console.log('emiting first')
    client.socket.emit('projects')
  })
}

// module.exports = function projects () {
//   var client = this
//   return client.connectedPromise || client.connect()
//     .then(function () {
//       return new Promise(function (resolve, reject) {
//         client.socket.on('info-complete', resolve)
//         client.socket.on('errored', reject)

//         client.socket.emit('projects')
//       })
//     })
// }
