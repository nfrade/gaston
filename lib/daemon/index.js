var log = require('npmlog')
  , http = require('http')
  , minimist = require('minimist')
  , SocketIO = require('socket.io')
  , api = require('./api')
  , config = require('../../config.json')
  , basePath = process.cwd();

var args = minimist( process.argv );
var apiPort = args.api || config['api-port'];

var server = http.createServer();
var io = SocketIO( server );

io.on('start', function(){
  console.log('starting io')
});

io.on('connect', function(socket){
  api.register(socket);
});

server.listen(apiPort, function(){
  log.info('gaston', 'is now running as a daemon');
});

