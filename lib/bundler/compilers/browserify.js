var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , Promise = require('promise')
  , browserify = require('browserify')
  , watchify = require('watchify')
  , Bundler
  , backtrackFile = require('../../utils/backtrack-file')
  , getGitHead = require('../../utils/get-git-head')
  , Inform = require('../../utils/inform') 
  , gitHeadPromise = getGitHead()
  , pkgPath = backtrackFile( 'package.json', process.cwd() );

var Compiler = module.exports = {
  options: undefined,
  browserify: undefined,

  setup: function(bundler){
    Bundler = bundler;
    Compiler.options = {
      debug: (Bundler.env === 'dev'),
      cache: {}, 
      packageCache: {}, 
      fullPaths: false
    }
    Compiler.browserify = browserify( path.join(Bundler.dirPath, 'index.js'), Compiler.options );
    
    var noLessTransform = require('./no-less-transform')(Bundler);
    Compiler.browserify.transform( noLessTransform, { global: true } );
  }, 

  compile: function(){
    var promise =  new Promise(function(fulfill, reject){
      log.info('browserify', 'compiling JS');
      var fileName = Bundler.env === 'dev'? 'bundle.js' : 'bundle.min.js';
      var filePath = path.join(Bundler.dirPath, fileName);
      var wStream = fs.createWriteStream( filePath, {encoding: 'utf8'} );
      wStream.on('close', function(){ 
        log.info('browserify', 'JS compiled successfully');
        fulfill();
      });
      var b = Compiler.browserify.bundle();
      if(!Compiler.watchify){
        Compiler.watchify = watchify(Compiler.browserify);
      }

      b.on('error', function(err){
        log.error('browserify', err);
        reject(err);
      });

      injectPackageJSON(wStream)
        .then(function(){
          b.pipe(wStream);
        });
    });

    return promise
      .catch(function(err){
        log.error('browserify', err);
      });
  }
};

var injectPackageJSON = function(wStream){
  var promise = gitHeadPromise
    .then(function(branch){
      var inform = new Inform({ branch: branch });
      inform.on('error', function (err) {
        log.error("inform error", err);
      });
      var pkgStream = fs.createReadStream(pkgPath)
        .on('readable', function(){
          pkgStream.pipe( inform )
            .on('error', function(err){
              log.error('inform error', 'pkgStream => inform')
            })
            .pipe( wStream )
              .on('error', function(err){
                log.error('inform error', 'inform => wStream')
              })
        })
        .on('error', function(err){
          log.error('inform error', err);
        });
    });

    return promise
      .catch(function(err){
        log.error()
      })
}
