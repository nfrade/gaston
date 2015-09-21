var client = require('./').client

client.socket.on('reload', function () {
  window.location.reload()
})
