var tester = require('../tester');

module.exports = function(config){
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
