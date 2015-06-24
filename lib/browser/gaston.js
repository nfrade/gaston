var package = require('package.json')
  , ui = require('./gaston-ui')
  , sourceMap = require('source-map');

var gaston = window.gaston = module.exports = {
  server: {
    ip: '{{gaston.ip}}',
    port: '{{gaston.port}}',
    socket: '{{gaston.socket}}'
  },
  remoteLogging: package.gaston['remote-logging'],
  serverAddress: '',
  socket: undefined,
  clientId: undefined,
  inited: false,
  connected: false,

  init: function(){
    if(this.inited){
      return false;
    }
    this.inited = true;

    //gets or initializes the config
    this.config = (localStorage.getItem('gaston') && JSON.parse( localStorage.getItem('gaston') ) ) || {};

    //if remote server, relaunch the page loading js from remote server
    if( this.config.remote && this.config.server ){
      if(!this.config.launched){
        gaston.set('launched', true);
        var server = this.config.server;
        var script = document.createElement('script');
        var buster = Math.floor(Math.random() * 999999);
        script.src = 'http://' + server.ip + ':' + server.port + '/bundle.js?' + buster;
        document.head.appendChild(script);
        return;
      }
    }
    gaston.unset('launched');

    require('./connect');
    gaston.connect();
    

    if( !gaston.remoteLogging ){
      gaston.run();
    }

    identifyGaston();
  },

  run: runApplication,
  
  on: function(ev, handler){
    if(!gaston.socket){
      return;
    }
    // console.log('ho ho ho', ev)
    gaston.socket.on(ev, handler);
  },

  emit: function(message, payload){
    gaston.socket.emit(message, payload);
  },

  set: function(key, value){
    this.config[key] = value;
    localStorage.setItem('gaston', JSON.stringify(this.config) );
  },

  unset: function(key){
    if( Array.isArray( this.config[key] ) ){
      gaston.config[key] = [];
    } else {
      delete gaston.config[key];
    }
    localStorage.setItem('gaston', JSON.stringify(gaston.config) );
  },

  get: function(key){
    return this[key];
  }, 

  reset: function(){
    localStorage.setItem( 'gaston', JSON.stringify({}) );
  },

  remote: function(server){
    if(server){
      gaston.set('server', server);
      gaston.set('remote', true);
    } else {
      gaston.set('remote', !gaston.config.remote);
    }
  }

};



Object.defineProperty(gaston, 'id', {
  set:function(val) {
    this._id = val;
    this.socket.emit('id', val);
  },
  get:function() {
    return this._id;
  }
});

gaston.init();

function identifyGaston(){
  var rex = /GastonID=(\w+-\w+-\w+-\d+)/;
  var search = window.location.search;
  var match = rex.exec(window.location.search);
  if(!match){
    var ua = gaston.config.ua;
    id = ua.platform + '-' + ua.device + '-' + ua.browser;
    id += '-' +  Math.floor(Math.random()* 999);
    gaston.set('$id', id);
    window.location.search += (search.length === 0? '' : '&') + 'GastonID=' + gaston.config.$id;
  } else {
    gaston.id = match[1];
  }
};


function runApplication(){

  if(gaston.remoteLogging){
    require('./take-over-console');
  }

  try {
    require('index.js');
  } catch(err){ 
    if(window.oldConsole){
      oldConsole.error(err);
    } else {
      console.error(err);
    }
  } finally {
    // window.onerror = function(message, url, lineNumber, column, error){
    //   console.log('error!!!!!!');
    // }
  }
}



