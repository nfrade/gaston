var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , keypress = require('keypress')
  , Tracker = require('gaston-time-tracker')
  , gaston = require('./gaston')
  , Bundler = require('./bundler')
  , config;

module.exports = function(cfg){
  config = cfg;
  keypress(process.stdin);
  process.stdin.on('keypress', function (ch, key) {
    switch(key.name.toLowerCase()){
      case 'c':
        if(key.ctrl){
          // Tracker.stop()
          //   .then(function(){
              process.exit(0);
            // });
        }
        break;
      case 'h': 
        helpPromise.then( function(data){ console.log(data); } );
        break;
      case 'b':
        gaston.isCompiling = true;
        gaston.build( config )
          .then(function(){
            gaston.isCompiling = false;
            Bundler.isBuilding = false;
          });
        break;
      case 'l':
        gaston.launch();
        break;
      case 'p':
        // Tracker.toggle();
        break;
      default: 
        log.error('command "', command, '"not recognized. Type "help" for help');
        break;
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

}

var helpPromise = fs.readFileAsync( path.join(__dirname, '../help', 'in-dev.txt'), 'utf8' );