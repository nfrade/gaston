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
    if( gaston.takeOverConsole ){
      gaston.run();
    }
  });

  gaston.on('build-complete', function(payload){
    console.info('build complete. Current version:', payload.version)
  });

  gaston.on('clients', function(clients){
    console.info('connected clients: ', clients);
  });

  gaston.on('reload', function(){
    var timeout = gaston.config.ua.device === 'desktop'? 0 : 250;
    setTimeout(function(){
      window.location.reload();
    }, timeout);
  });

  gaston.on('server-message', function(payload){
    if(payload.type === 'error'){
      document.body.innerHTML = '<div class="gaston-error">'+payload.message+'</div>';
    }
    console.info('server-message', payload);
  });
};