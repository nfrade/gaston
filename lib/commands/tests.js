var tester = require('../tester');
var parseArgs = require('minimist');
var args = parseArgs(process.argv);

module.exports = function(config){
  var testType;

  if( ~args._.indexOf('node', 1) ){
    testType = 'node';
  } else if( ~args.indexOf('common') ) {
    testType = 'common';
  } else {
    testType = 'node';
  }

  var files = args.f || args.files;

  tester(testType, config, files);
};
