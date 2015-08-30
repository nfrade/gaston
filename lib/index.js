var Promise = require('bluebird')
  , fs = require('vigour-fs-promised')
  // , npm = require('npm')
  , path = require('path')
  , log = require('npmlog')
  , mkdirp = require('mkdirp');


var config = require('./config')

var commandPath = path.join(__dirname, '..', 'commands', config.command + '.js');

fs.existsAsync(commandPath)
  .then(function(exists){
    if(!exists){
      log.error('gaston', config.command + ': no such command')
      log.info('gaston', 'type "gaston help" for help');
      process.exit(1);
    }

    require(commandPath)(config);
  });

mkdirp( path.join(config.basePath, 'bundles') );