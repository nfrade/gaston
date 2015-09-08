var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , os = require('os')
  , path = require('path')
  , api = require('../api')
  , config = require('../../config.json')
  , minimist = require('minimist')
  , basePath = process.cwd()
  // , infoPath = path.join(os.tmpdir(), 'gaston-info.log')
  // , errorPath = path.join(os.tmpdir(), 'gaston-error.log')
  // , infoStream = fs.createWriteStream( infoPath, { flags: 'a' } )
  // , errorStream = fs.createWriteStream( errorPath, { flags: 'a'} );

// process.stdout.pipe( infoStream );
// process.stderr.pipe( errorStream );
require('../daemon');

console.log('gaston', 'is now running as a daemon');

var args = minimist( process.argv );
var apiPort = args.api || config['api-port'];

api.start( { port: apiPort } )
  .then(function(){
    log.info('gaston-api', 'listening on port', apiPort );
  });
