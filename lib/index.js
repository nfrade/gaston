var fs = require('graceful-fs')
  , path = require('path')
  , log = require('npmlog')
  , config = require('./config');

var commandPath = path.join(__dirname, 'commands', config.command + '.js');

fs.exists(commandPath, function(exists){
  if(!exists){
    log.error('gaston', command + ': no such command')
    log.info('gaston', 'type "gaston help" for help');
    process.exit(1);
  }

  log.info('gaston', 'running ' + config.command);
  require(commandPath)();

}); 
