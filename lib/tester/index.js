var log = require('npmlog')
  , childProcess = require('child_process')
  , sinonChai = require('sinon-chai')
  , sinon = require('sinon')
  , chai = require('chai')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , Promise = require('bluebird')
  , browserify = require('browserify')
  , glob = Promise.promisify( require('glob') )
  , testSauce = require('./sauce')
  , getFiles = require('./get-files')
  , compile = require('./compile')
  , dependencies = [
    'node_modules/mocha/mocha.js',
    'node_modules/mocha/mocha.css',
    'gaston-files/test-runner.html'
  ]
  , targets = []
  , config = require('../config');

var isNode = global.isNode = typeof window === 'undefined';

if(isNode){
  global.gaston = {};
  global.gaston.log = require('../browser/log');
  global.console.clear = function(){};
  global.console.group = function(){};
  global.console.groupEnd = function(){};
  global.log = function(){};
  global.log.event = function(){};
  global.sinon = sinon;
  chai.use(sinonChai);
}

module.exports = function(testType, files){
  log.info('env.isTravis?', process.env.isTravis);

  switch(testType){
    case 'sauce':
      testSauce(files)
        .then(exit, exitError);
      break;
    case 'browser':
      testBrowser(files, 'test/browser')
        .then(exit, exitError);
      break;
    case 'node':
      testNode(files, 'test/node')
        .then(exit, exitError);
      break;
    case 'common':
      var exitCode = 0;
      log.info('tester', 'running tests through node from test/common');
      testNode(files, 'test/common')
        .then(function(failures){
          exitCode += failures;
          log.info('tester', 'running tests through phantom from test/common');
          return testBrowser(files, 'test/common')
        })
        .then(function(failures){
          exitCode += failures;
          return exitCode;
        })
        .then(exit, exitError);
      break;
    case 'all':
      var exitCode = 0;
      log.info('tester', 'running tests through node from test/common');
      testNode(files, 'test/common')
        .then(function(failures){
          exitCode += failures;
          log.info('tester', 'running tests through phantom from test/common');
          return testBrowser(files, 'test/common')
        })
        .then(function(failures){
          exitCode += failures;
          return exitCode;
        })
        .then(function(failures){
          exitCode += failures;
          log.info('tester', 'running tests through node from test/node');
          return testNode(files, 'test/node')
        })
        .then(function(failures){
          exitCode += failures;
          log.info('tester', 'running tests through phantom from test/browser');
          return testBrowser(files, 'test/browser')
        })
        .then(function(failures){
          exitCode += failures;
          return exitCode;
        })
        .then(function(failures){
          targets.forEach(function(target){
            if( fs.existsSync(target) ){
              fs.unlinkSync(target);
            }
          });
          return failures;
        })
        .then(exit);
      break;
  }

};

var exit = function(failures){
  if(failures === 0){
    log.info('tester', 'All tests passed, yay!!');
  } else {
    log.error('tester', failures + ' tests failed');
  }
  process.exit(failures);
}

function exitError(err) {
  if (err && err.stack) {
    log.error('tester', err.stack);
  }
  process.exit(1);
}

var testNode = function(reqPath, testPath){
  global.chai = require('chai');
  global.expect = global.chai.expect;
  global.assert = global.chai.assert;
  chai.use( require( './chai/performance' ) )
  chai.use( require( './chai/message' ) )

  var Mocha = require('mocha'),
    mocha = new Mocha({
      ui: 'bdd',
      // reporter: 'nyan'
      // reporter: 'list'
    });

  return getFiles( reqPath || testPath )
    .then(function(files){
      for(var i = 0, l = files.length; i < l; i++){
        var file = files[i];
        mocha.addFile(file);
      };
    })
    .then(function(){
      return new Promise(function(fulfill, reject){
        return mocha.run(function(failures){
          fulfill(failures);
        });
      });
    });

};

var testBrowser = function(reqPath, testPath){
  for( var i = 0, l = dependencies.length; i < l; i++){
    var source = path.join( __dirname, '../..', (dependencies[i]) )
    var fileName = dependencies[i].split(path.sep).pop();
    var target = path.join( config.basePath, 'test',  fileName);
    targets.push(target);

    fs.createReadStream(source)
      .pipe( fs.createWriteStream(target) );
  }

  return getFiles( reqPath || testPath )
    .then(function(files){
      log.info('tester', 'compiling test files');
      var tester = path.join(__dirname, '..', 'browser', 'tester.js');
      files.unshift( tester )
      files = files.filter(function(file){
        return file.indexOf('bundle') === -1;
      });

      return files;
    })
    .then(compile)
    .then(function(){
      return new Promise(function(fulfill){
        log.info('tester', 'finished compiling');
        var indexPath = path.join(config.basePath, 'test/test-runner.html');

        /*
          Users/jim/dev/gaston/node_modules/mocha-phantomjs/node_modules/mocha/lib/reporters/nyan.js
        */

        var spawn = require('child_process').spawn,
          mpjsPath = path.join( __dirname, '../../', 'node_modules', '.bin', 'mocha-phantomjs')
          exec = spawn(mpjsPath, [
            // '-R', __dirname+'/../../node_modules/mocha/lib/reporters/nyan.js',
            indexPath
          ]);

        exec.stdout.pipe(process.stdout);

        exec.on('close', function (code, signal) {
          fulfill(code);
        });
      })
    });
}
