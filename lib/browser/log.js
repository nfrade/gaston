//index for gaston log

//this is a rudemntary start but i rly needed logs -- this is just for the browser node version comes soon!
// var gaston = gaston || require('../gason')

var gaston;

//TODO:have make this into a folder and a seperate browser/node entry point (dealing /w colors etc etc)

module.exports = {
  init: function(){
    gaston = window.gaston;

    gaston.on('log', function(payload) {
      //parse args
      if( !fromMe(payload) ){
        console.log('log from: ', payload.client, payload.data);
      }
    });

    gaston.on('browser-error', function(payload){
      if( !fromMe(payload) ){
        console.error('got a browser error from ' + payload.client.device, payload.client, payload.data.stack);
      }
      

    });
  }
}

var fromMe = function(payload){
  var index = gaston.sentMessages.indexOf(payload.data.$id);
  if( index >= 0 ){
    return gaston.sentMessages.splice(index, 1);
  } else {
    return false;
  }
}



function log(args, fromServer) {
	console.log(gaston.socket.client)

	if(!fromServer) {

	}
	console.log.apply(console, args)
}
