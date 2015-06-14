//here are all hooks to the socket server added
var log = require('npmlog')
	, SocketServer = require('../server/socket-server')
	, StackParser = require('./stack-parser')
	, clientFields = [ 
			'id', 
			'browser', 
			'version', 
			'prefix', 
			'platform', 
			'device'
		];

SocketServer.io.on('connection', function(socket) {

	socket.on('log', function(payload) { console.log(payload)
		var client = socket.$client;
		//using socket.$client now to recieve id etc
		var clientInfo = getClientInfo( client );

		SocketServer.broadcast('log', {
			data:payload,
			client: clientInfo
		}, 
		{ 
			exclude:[ client ] 
		});

	});

	socket.on('browser-error', function(err){
		var clientInfo = getClientInfo( socket.$client );
		var parser = new StackParser(err);
		parser.parse()
			.then(function(stack){
				console.log(stack);
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

