var log = require('npmlog')
  , childProcess = require('child_process')
  , fs = require('graceful-fs')
  , path = require('path')
  , Promise = require('bluebird')
  , browserify = require('browserify')
  , glob = Promise.promisify( require('glob') )
  , dependencies = [
    'node_modules/mocha/mocha.js',
    'node_modules/mocha/mocha.css',
    'gaston-files/test-runner.html'
  ]
  , targets = []
  , config;

module.exports = function(testType, cfg){
  config = cfg;

  switch(testType){
    case 'browser':
      testBrowser('test/browser');
      break;
    case 'node':
      testNode('test/node');
      break;
    case 'common':
      log.info('tester', 'running tests through node from test/common');
      testNode('test/common')
        .then(function(){
          log.info('tester', 'running tests through phantom from test/common');
          testPhantom('test/common')
        });
  } 
};

var testNode = function(testPath){
  global.chai = require('chai');
  global.expect = global.chai.expect;
  global.assert = global.chai.assert;
  chai.use( require( './chai/performance' ) )
  chai.use( require( './chai/message' ) )

  var Mocha = require('mocha'),
    mocha = new Mocha({
      ui: 'bdd',
      reporter: 'list'
    });

  return glob( path.join(config.basePath, testPath, '**/*.js') )
    .then(function(files){
      return files.filter(function(file){
        return !~file.indexOf('bundle')
          && !~file.indexOf('build');
      })
    })
    .then(function(files){
      files.forEach(function(file){
        mocha.addFile(file);
      });
    })
    .then(function(){
      var run = Promise.promisify(mocha.run);
      return mocha.run();
    });

};

var testPhantom = function(testPath){
  for( var i = 0, l = dependencies.length; i < l; i++){
    var source = path.join( __dirname, '../..', (dependencies[i]) )
    var fileName = dependencies[i].split(path.sep).pop();
    var target = path.join( config.basePath, 'test',  fileName);
    targets.push(target);

    fs.createReadStream(source)
      .pipe( fs.createWriteStream(target) );
  }

  glob( path.join(config.basePath, testPath, '**/index.js') )
    .then(function(files){
      log.info('tester', 'compiling test files');
      var tester = path.join(__dirname, '..', 'browser', 'tester.js');
      files.unshift( tester )
      return files;
    })
    .then(compile)
    .then(function(){
      log.info('tester', 'finished compiling');
      var indexPath = path.join(config.basePath, 'test/test-runner.html');
      
      var spawn = require('child_process').spawn,
        mpjsPath = path.join( __dirname, '../../', 'node_modules', '.bin', 'mocha-phantomjs')
        exec = spawn(mpjsPath, [
          '-R', 'list',
          indexPath
        ]);

      exec.stdout.pipe(process.stdout);

      exec.on('close', function (code, signal) {
        targets.forEach(function(target){
          fs.unlinkSync(target);
        })
        if(code === 0){
          log.info('tester', 'All tests passed, yay!!');
        } else {
          log.error('tester', code + ' tests failed');
        }
        process.exit(code);
      });
    });
}


var compile = function(files){
  return new Promise(function(fulfill, reject){
    var br = browserify(files);
    br.require( path.join(__dirname, '../..', 'node_modules/chai'), {
      expose: 'chai'
    } );
    var b = br.bundle();
    var bPath = path.join(config.basePath, 'test', 'bundle.js');
    var wStream = fs.createWriteStream(bPath);

    b.on('error', function(err){
      log.error('gaston-tester', err);
      reject(err);
    });

    var bundle = '';
    b.on('data', function(data){
      bundle += data.toString('utf8');
    });

    b.on('end', function(){
      fulfill(bundle);
    });

    var bPath = path.join(config.basePath, 'test', 'bundle.js')
    b.pipe( fs.createWriteStream(bPath) )
  })
  
};