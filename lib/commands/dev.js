var log = require('npmlog')
  , fs = require('fs')
  , path = require('path')
  , denodeify = require('denodeify')
  , readFile = denodeify( fs.readFile )
  , gaston = require('../gaston')
  , stdin = process.openStdin();

module.exports = function(){
  gaston.dev()
    .then(function(){ stdin.on('data', stdinListener) })
    .catch( function(err){ log.error('gaston dev', err); } );
};

var stdinListener = function(chunk) {
  command = chunk.toString().replace('\n', '');
  switch(command){
    case 'help':
      helpPromise.then( function(data){ console.log(data); } );
      break;
    case 'build':
      gaston.build();
      break;
    case 'launch':
      gaston.launch();
      break;
    default: 
      log.error('command "', command, '"not recognized. Type "help" for help');
      break;
  }
};

var helpPromise = readFile( path.join(__dirname, 'help.txt'), 'utf8' );