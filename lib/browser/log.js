//index for gaston log

//this is a rudemntary start but i rly needed logs -- this is just for the browser node version comes soon!
// var gaston = gaston || require('../gason')

var gaston = window.gaston

//TODO:have make this into a folder and a seperate browser/node entry point (dealing /w colors etc etc)

gaston.log = function() {
	log(arguments)
};

gaston.socket.on('log', function() {
	// console.log('loggit', )
	//parse args
	log( arguments, true )

});

function log(args, fromServer) {
	console.log(gaston.socket.client)

	if(!fromServer) {
		gaston.socket.emit('log', args )
	}
	console.log.apply(console, args)
}