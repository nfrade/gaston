var tester = require('../lib/tester')
var parseArgs = require('minimist');
var args = parseArgs(process.argv);
var log = require('npmlog');


process.on('unhandledRejection', function (err) {
  throw err;
});

process.on('uncaughtException', function (err) {
  log.error(config.command, err.stack);
  process.exit(1);
});


module.exports = function(cfg){
  config = cfg;
  var testType;

  if( ~args._.indexOf('node', 1) ){
    testType = 'node';
  } else if( ~args._.indexOf('common') ) {
    testType = 'common';
  } else if( ~args._.indexOf('browser') ){
    testType = 'browser';
  } else {
    testType = 'all';
  }

  var files = args.f || args.files;

  tester(testType, config, files);
};
