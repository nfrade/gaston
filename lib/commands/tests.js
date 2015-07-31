var tester = require('../tester');

module.exports = function(config){
  var testType;

  var args = Array.prototype.slice.call(process.argv);

  if( args.indexOf('node') > 0 ){
    testType = 'node';
  } else if( ~args.indexOf('common') ) {
    testType = 'common';
  } else if( ~args.indexOf('perf') ){
    testType = 'perf';
  } else {
    testType = 'phantom';
  }

  tester(testType, config);
};
