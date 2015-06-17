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

	socket.on('log', function(payload) {
		var client = socket.$client;
		//using socket.$client now to recieve id etc
		var clientInfo = getClientInfo( client );
		console.log(payload.error.stack);
		SocketServer.broadcast('log', {
			data: payload,
			client: clientInfo
		}, 
		{ 
			exclude:[ client ] 
		});

	});

	socket.on('browser-console', function(error){
		var client = socket.$client;
		var clientInfo = getClientInfo( client );
		
		SocketServer.broadcast('browser-console', {
			data: error,
			client: clientInfo
		},
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

