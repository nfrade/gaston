var log = require('npmlog')
  , denodeify = require('denodeify')
  , fs = require('graceful-fs')
  , writeFile = denodeify( fs.writeFile )
  , path = require('path')
  , Promise = require('promise')
  , browserify = require('browserify')
  , watchify = require('watchify')
  , uglify = require('uglify-js')
  , Bundler
  , backtrackFile = require('../../utils/backtrack-file')
  , repo = require('../../utils/repo')
  , Inform = require('./inform');

var Compiler = module.exports = {
  options: undefined,
  browserify: undefined,

  setup: function(bundler){
    Bundler = bundler;
    Compiler.options = {
      debug: (Bundler.env === 'dev'),
      cache: {}, 
      packageCache: {}, 
      fullPaths: false,
      noParse: []
    };
  }, 

  compile: function(){
    console.log( 'browserifying', path.join(Bundler.dirPath, 'index.js') )
    Compiler.browserify = browserify( path.join(Bundler.dirPath, 'index.js'), Compiler.options );
    var noLessTransform = require('./no-less-transform')(Bundler);
    var ignoresTransform = require('./ignores-transform')(Bundler);
    var stripify = require('stripify');
    Compiler.browserify.transform( noLessTransform, { global: true } );
    Compiler.browserify.transform( ignoresTransform, { global: true } );
    if(Bundler.building){
      Compiler.browserify.transform(stripify, {replacement: 'void(0)', global: true} );
    } else {
      var browserGastonPath = path.join(__dirname, '../../', 'browser/gaston');
      Compiler.browserify.add( browserGastonPath );
    }

    var promise =  new Promise(function(fulfill, reject){
      log.info('browserify', 'compiling JS');
      var fileName = 'bundle.js';
      var filePath = path.join(Bundler.dirPath, fileName);
      var wStream = fs.createWriteStream( filePath, {encoding: 'utf8'} );
      wStream.on('close', function(){ 
        log.info('browserify', 'JS compiled successfully');
        if(Bundler.building){
          log.info('browserify', 'uglifying JS');
          Compiler.uglify()
            .then(function(){
              log.info('browserify', 'JS minified to build.js');
            });
          fulfill();
        } else {
          fulfill();
        }
      });
      var b = Compiler.browserify.bundle();
      if(Bundler.Watcher && !Bundler.Watcher.watchify){
        Bundler.Watcher.watchify = watchify(Compiler.browserify);
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

    return promise;
  },

  uglify: function(source, target){
    source = source || path.join(Bundler.dirPath, 'bundle.js');
    target = target || path.join(Bundler.dirPath, 'build.js');
    var uglified = uglify.minify(source);
    return writeFile(target, uglified.code, 'utf8');
  }

};

var injectPackageJSON = function(wStream){
  return repo.getBranch()
    .then(function(branch){
      var inform = new Inform({ branch: branch });
      log.info('branch:', branch)
      inform.on('error', function (err) {
        log.error('inform error', err);
      });
      var pkgPath = backtrackFile('package.json');
      var pkgStream = fs.createReadStream(pkgPath);
      pkgStream
        .pipe(inform)
        .pipe(wStream);
    });

    return promise
      .catch(function(err){
        log.error()
      })
}
