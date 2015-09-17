var log = require('npmlog')
  , gaston = require('../../')
  , tester = require('../../tester')

var test = module.exports = function test(args){
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

  console.log('testType', testType)

  tester(testType, files);
};