var log = require('npmlog')
  , minimist = require('minimist')
  , httpServer = require('./http-server')
  , api = require('./api')
  , basePath = process.cwd()
  , config = require('../config.json');

var args = minimist( process.argv );
var apiPort = args.api || config['api-port'];

api.start( { port: apiPort } )
  .then(function(){
    log.info('gaston-api', 'listening on port', apiPort )
  });
