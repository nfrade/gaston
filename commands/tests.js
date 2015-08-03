var tester = require('../lib/tester')
  , config;

module.exports = function(cfg){
  config = cfg;
  var testType;

  var args = Array.prototype.slice.call(process.argv);

  if( ~args.indexOf('node', 1) ){
    testType = 'node';
  } else if( ~args.indexOf('common') ) {
    testType = 'common';
  } else {
    testType = 'browser';
  }

  tester(testType, config);
};
