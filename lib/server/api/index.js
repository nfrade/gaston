var log = require('npmlog')
  apiMethods = ['build'];

var api = module.exports = {
  socket: null,
  init: function(sock){
    api.socket = sock;
    api.socket.on('build', function(data){
      console.log('building')
    });
    
    // for(var i = 0, len = apiMethods.length; i < len; i++){
    //   var method = require('./'+apiMethods[i]);
    //   io.on( apiMethods[i], function(message, payload){
    //     method(payload);
    //   } );
    // }
  },

  reloadBrowser: function(){
    log.info('socketServer', 'reloading the browser');
    api.socket.emit('reload');
  }
};

