var tester = require('../lib/tester')
var parseArgs = require('minimist');
var args = parseArgs(process.argv);

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
    testType = 'node';
  }

  var files = args.f || args.files;

  tester(testType, config, files);
};
