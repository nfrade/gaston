var log = require('npmlog')
  , childProcess = require('child_process')
  , sinonChai = require('sinon-chai')
  , sinon = require('sinon')
  , chai = require('chai')
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

var isNode = typeof window === 'undefined';

if(isNode){
  global.console.clear = function(){};
  global.sinon = sinon;
  chai.use(sinonChai);
}

module.exports = function(testType, cfg, files){
  config = cfg;

  switch(testType){
    case 'browser':
      testBrowser(files, 'test/browser')
        .then( exit );
      break;
    case 'node':
      testNode(files, 'test/node')
        // .then(exit);
      break;
    case 'common':
      var exitCode = 0;
      log.info('tester', 'running tests through node from test/common');
      testNode(files, 'test/common')
        .then(function(failures){
          exitCode += failures
          log.info('tester', 'running tests through phantom from test/common');
          return testBrowser(files, 'test/common')
        })
        .then(function(failures){
          exitCode += failures;
          return exitCode;
        })
        .then(exit);
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

var testNode = function(reqPath, testPath){
  global.chai = require('chai');
  global.expect = global.chai.expect;
  global.assert = global.chai.assert;
  chai.use( require( './chai/performance' ) )
  chai.use( require( './chai/message' ) )

  var Mocha = require('mocha'),
    mocha = new Mocha({
      ui: 'bdd'
      // reporter: 'list'
    });

  var globFilter = getGlobFilter(reqPath, testPath);

  return glob( globFilter )
    .then(function(files){
      //to be removed when merging refactor
      return files.filter(function(file){
        var stays = !~file.indexOf('bundle')
          && !~file.indexOf('build');
        return stays;
      })
    })
    .then(function(files){
      files.forEach(function(file){
        mocha.addFile(file);
      });
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

  var globFilter = getGlobFilter(reqPath, testPath);

  
  return glob( globFilter )
    .then(function(files){
      log.info('tester', 'compiling test files');
      var tester = path.join(__dirname, '..', 'browser', 'tester.js');
      files.unshift( tester )
      return files;
    })
    .then(compile)
    .then(function(){
      return new Promise(function(fulfill, reject){
        log.info('tester', 'finished compiling');
        var indexPath = path.join(config.basePath, 'test/test-runner.html');

        var spawn = require('child_process').spawn,
          mpjsPath = path.join( __dirname, '../../', 'node_modules', '.bin', 'mocha-phantomjs')
          exec = spawn(mpjsPath, [
            // '-R', 'list',
            indexPath
          ]);

        exec.stdout.pipe(process.stdout);

        exec.on('close', function (code, signal) {
          targets.forEach(function(target){
            fs.unlinkSync(target);
          });

          fulfill(code);
        });
      })
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
      delete err.stream;
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

var getGlobFilter = function(reqPath, testPath){
  var globFilter;
  if(!reqPath){
    globFilter = path.join(config.basePath, testPath, '**/*.js');
  } else {
    if( !path.extname(reqPath) ){
      globFilter = path.join(config.basePath, reqPath, '**/*.js');
    } else {
      globFilter = path.join(config.basePath, reqPath);
    }
  }
  return globFilter;
}
