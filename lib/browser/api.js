var package = require('package.json');

var API = module.exports = {
  init: function(){
    setAPI();
  }
};

var setAPI = function(){

  gaston.build = function(){
    gaston.emit('build');
  };

  gaston.identify = function(){
    gaston.emit('identify-clients');
  };

  gaston.on('smaps', function(smaps){
    gaston.smaps = smaps;
    if( gaston.remoteLogging ){
      gaston.run();
    }
  });

  gaston.on('build-complete', function(payload){
    console.info('build complete. Current version:', payload.version)
  });

  gaston.on('clients', function(clients){
    console.info('connected clients: ', clients);
  });

  gaston.on('server-message', function(payload){
    if(payload.type === 'error'){
      document.body.innerHTML = '<div class="gaston-error">'+payload.message+'</div>';
    }
    console.info('server-message', payload);
    if(payload.type === 'file-changed'){
      window.location.reload();
    }
  });
};