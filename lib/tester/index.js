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
  , dependencies = [
    'node_modules/mocha/mocha.js',
    'node_modules/mocha/mocha.css',
    'gaston-files/test-runner.html'
  ]
  , targets = []
  , config;

var isNode = global.isNode = typeof window === 'undefined';

if(isNode){
  global.console.clear = function(){};
  global.console.group = function(){};
  global.console.groupEnd = function(){};
  global.log = function(){};
  global.log.event = function(){};
  global.sinon = sinon;
  chai.use(sinonChai);
}

module.exports = function(testType, cfg, files){
  config = cfg;
  log.info('env.isTravis?', process.env.isTravis);
  switch(testType){
    case 'browser':
      testBrowser(files, 'test/browser')
        .then( exit );
      break;
    case 'node':
      testNode(files, 'test/node')
        .then(exit);
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
        .then(exit);
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
      return new Promise(function(fulfill, reject){
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
  var globFilter, finalPath;
  if(!reqPath){
    var testRoot = path.join( config.basePath, testPath );
    globFilter = path.join(testRoot, '**/*.js');
  } else {
    var basePath = process.env.isTravis? config.basePath : process.cwd();
    log.info('basePath', basePath);
    if( !path.extname(reqPath) ){
      finalPath = path.join(basePath, reqPath);
      globFilter = path.join(finalPath, '**/*.js');
    } else {
      globFilter = finalPath;
    }
  }
  return globFilter;
}

function getFiles(basePath){
  var files = [];

  if( !fs.existsSync(basePath) ){
    return Promise.resolve(files);
  }

  (function recur(base){
    var list = fs.readdirSync(base);
    for(var i = 0, l = list.length; i < l; i++){
      var file = path.join( base, list[i] );
      if(path.extname(file) === '.js'){
        if( !~file.indexOf('bundle.js') && !~file.indexOf('build.js') ){
          files.push(file);
        }
      }
      var stat = fs.statSync(file);
      if( stat.isDirectory(file) ){
        recur(file);
      }
    };
  })(basePath);
  
  return Promise.resolve( files );
}
                                                                                                                            