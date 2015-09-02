var log = require('npmlog')
  , minimist = require('minimist')
  , httpServer = require('./http-server')
  , api = require('./api')
  , basePath = process.cwd()
  , config = require('../config.json');

var args = minimist( process.argv );
var httpPort = args.http || config['http-port'];
var apiPort = args.api || config['api-port'];

httpServer.start({
  basePath: basePath,
  port: httpPort
})
  .then(function(){
    log.info('http-server', 'running on port', httpPort);
  });

api.start({
  port: apiPort
})
  .then(function(){
    log.info('gaston-api', 'listening on port', apiPort )
  });