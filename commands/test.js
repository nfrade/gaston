var tester = require('../lib/tester')
var parseArgs = require('minimist');
var args = parseArgs(process.argv);
var log = require('npmlog');

var config = require('../lib/config');


process.on('unhandledRejection', function (err) {
  throw err;
});

process.on('uncaughtException', function (err) {
  if (err && err.stack) {
    log.error(config.command, err.stack);
  }
  process.exit(1);
});


module.exports = function test () {
  var testType;

  if( ~args._.indexOf('node', 1) ){
    testType = 'node';
  } else if( ~args._.indexOf('common') ) {
    testType = 'common';
  } else if( ~args._.indexOf('browser') ){
    testType = 'browser';
  } else if( ~args._.indexOf('sauce') ){
    testType = 'sauce';
  } else {
    testType = 'all';
  }

  var files = args.f || args.files;

  tester(testType, files);
};
