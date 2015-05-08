var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , denodeify = require('denodeify')
  , readFile = denodeify( fs.readFile )
  , builder = require('../builder')
  , Server = require('../server');

module.exports = function(options){
  return function(chunk) {
    // Server = Server || require('./server');
    command = chunk.toString().replace('\n', '');
    switch(command){
      case 'help':
        helpPromise.then(function(data){
          console.log(data);
        });
        break;
      case 'build':
        builder.run(options);
        break;
      case 'launch':
        Server.launch();
        break;
      default: 
        log.error('command "', command, '"not recognized. Type "help" for help');
        break;
    }
  }
};

var helpPromise = readFile( path.join(__dirname, 'help.txt'), 'utf8' );