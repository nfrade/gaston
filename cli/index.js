var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , minimist = require('minimist')
  , io = require('./io-client')
  , commandsPath = path.join( __dirname, 'commands')
  , args = minimist( process.argv.slice(2) )
  , command

var cmd = args._[0] || 'start';
var cmdPath = path.join( commandsPath, cmd + '.js' );

fs.existsAsync( cmdPath )
  .then(function(exists){
    if(exists){
      return io.connect();
    } else {
      log.error('command', cmd, 'not supported');
      process.exit(1);
    }
  })
  .then(function(socket){
    command = require(cmdPath);
    return command(io, args);
  })
  .then(function(){
    process.exit(0);
  })
  .catch(function(err){
    if(err.description === 503){
      log.error('gaston', 'daemon not running')
    } else {
      log.error('gaston', err);
    }
    process.exit(1);
  });