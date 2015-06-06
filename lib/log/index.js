//here are all hooks to the socket server added
var sockets = require('../server/socket-server');
var log = require('npmlog');
var clientFields = [ 
			'id', 
			'browser', 
			'version', 
			'prefix', 
			'platform', 
			'device'
		];

sockets.io.on('connection', function(socket) {

	socket.on('log', function(payload) {

		//using socket.$client now to recieve id etc
		var client = socket.$client;
		var clientInfo = {};

		log.info('hey', payload);

		clientFields.forEach(function(key) {
			clientInfo[key] = client[key];
		});

		sockets.broadcast('log', {
			data:payload,
			client: clientInfo
		});

	});

});
