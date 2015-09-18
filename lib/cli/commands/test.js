var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , gaston = require('../../')
  , Tester = require('../../tester')
  , allTestTypes = ['node', 'common', 'browser']

var test = module.exports = function test(args){
  var runners = args.r || args.runner || allTestTypes;
  var source = args.s || args.source || process.cwd();

  if( !path.isAbsolute(source) ){
    source = path.join( process.cwd(), source );
  }

  var stream;
  var output = args.o || args.output;
  if( output ){
    stream = fs.createWriteStream(output);
  }

  var options = {
    runners: runners,
    source: source,
    stream: stream || process.stdout
  };

  var tester = new Tester(options);
  return tester.run()
    .then(function(errors){
      log.info('gaston test', errors, 'tests failed');
      return errors;
    });

};