var io = require('socket.io-client');
var socket = io('http://localhost:8081')

socket.on('reload', function(){ console.log('reloading')
  window.location.reload();
});
