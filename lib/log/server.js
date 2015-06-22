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

	socket.on('browser-error', function(payload) {
		var client = socket.$client;
		//using socket.$client now to recieve id etc
		var clientInfo = getClientInfo( client );
		payload.client = getClientInfo( client );
		SocketServer.broadcast('browser-error', payload,
		{ 
			exclude:[ client ] 
		});
	});

	socket.on('browser-console', function(payload){
		var client = socket.$client;
		payload.client = getClientInfo( client );
		SocketServer.broadcast('browser-console', payload,
		{ 
			exclude:[ client ] 
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

