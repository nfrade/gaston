//here are all hooks to the socket server added
var log = require('npmlog')
	, SocketServer = require('../server/socket-server')
	, clientFields = [ 
			'id', 
			'browser', 
			'version', 
			'prefix', 
			'platform', 
			'device'
		];

SocketServer.io.on('connection', function(socket) {

	socket.on('id', function(payload){
		console.log('id', payload);
	});

	socket.on('browser-error', function(payload) {
		var client = socket.$client;
		//using socket.$client now to recieve id etc
		var clientInfo = getClientInfo( client );
		console.log('browser-error', payload);
		

		// SocketServer.broadcast('log', {
		// 	data: payload,
		// 	client: clientInfo
		// }, 
		// { 
		// 	exclude:[ client ] 
		// });

	});
console.log('attaching here')
	socket.on('browser-console', function(payload){
		var client = socket.$client;
		payload.client = getClientInfo( client );
		console.log('received browser-console');
		SocketServer.broadcast('browser-console', payload,
		{ 
			// exclude:[ client ] 
		});
		
	});

});

var getClientInfo = function(client){
	var clientInfo = {};
	clientFields.forEach(function(key) {
		clientInfo[key] = client[key];
	});
	return clientInfo;
};

