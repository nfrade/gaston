var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , gaston = require('../../')
  , Tester = require('../../tester')
  , backtrackFile = require('../../utils/backtrack-file');

var test = module.exports = function test(args){
  var runners = args.r || args.runner || 'all';
  var file = args.f || args.file;
  var source = args.s || args.source;

  if( source && !path.isAbsolute(source) ){
    source = path.join( process.cwd(), source );
  }

  if(!file && !source){
    var packagePath = backtrackFile('package.json', process.cwd());
    source = path.join( path.dirname(packagePath), 'test' );
  }

  var stream;
  var output = args.o || args.output;
  if( output ){
    stream = fs.createWriteStream(output);
  }

  var options = {
    runners: runners,
    file: file,
    source: source,
    //stream: stream || process.stdout
  };

  var tester = new Tester(options);
  return tester.run()
    .then(function(errors){
      log.info('gaston test', errors, 'tests failed');
      return errors;
    });

};