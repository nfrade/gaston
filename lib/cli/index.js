var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , minimist = require('minimist')
  , commandsPath = path.join( __dirname, 'commands')
  , args = minimist( process.argv.slice(2) )
  , command

var cmd = args._[0] || 'start';
var cmdPath = path.join( commandsPath, cmd + '.js' );

fs.existsAsync( cmdPath )
  .then(function(exists){
    if(!exists){
      log.error('command', cmd, 'not supported');
      process.exit(1);
    }
  })
  .then(function(socket){
    command = require(cmdPath);
    return command(args);
  })
  .then(function(){
    process.exit(0);
  })
  .catch(function(err){
    if( err && err.description && err.description === 503){
      log.error('gaston', 'daemon not running')
    } else {
      log.error('gaston', err);
    }
    process.exit(1);
  });