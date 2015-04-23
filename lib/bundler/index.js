var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , promise = require('Promise')
  , browserify = require('browserify')
  , less = require('less');

var styleRegExp = /\/.+\.less$/;

var Bundler = module.exports = {
  Watcher: undefined,
  env: undefined,
  dirPath: undefined,
  compilerPromise: undefined,
  cssFilesToCompile: [],
  cssToCompile: [],
  compiledCSS: [],

  setup: function(options){
    options = options || {};
    Bundler.env = options.env || 'dev'; // ['dev', 'prod']
    Bundler.Watcher = options.Watcher;
    Bundler.dirPath = options.path;
    var jsCompiler = options.jsCompiler || 'browserify';
    var cssCompiler = options.cssCompiler || 'less';
    Bundler.jsCompiler = require('./compilers/' + jsCompiler);
    Bundler.cssCompiler = require('./compilers/' + cssCompiler);
    Bundler.jsCompiler.setup(Bundler);
    Bundler.cssCompiler.setup(Bundler);
  },

  compile: function(){
    Bundler.cssToCompile = [];
    Bundler.compilerPromise = Bundler.jsCompiler.compile()
      .then( function(){
        return Bundler.cssCompiler.compile(Bundler.cssToCompile);
      } )
      .then( Bundler.writeCssToBundle )
      .then(function(){
        log.info('bundler', 'compilation process finished successfully');
        log.info('', '-----------------------------------------------------------');
      }).catch(function(err){
        log.err('bundler', err)
      });
    return Bundler.compilerPromise;
  },

  writeCssToBundle: function(cssToWrite){
    return new Promise(function(fulfill, reject){
      var bundleName = Bundler.env === 'dev'? 'bundle' : 'bundle.min';
      var bundlePath = path.join(Bundler.dirPath, bundleName + '.css');
      var wStream = fs.createWriteStream(bundlePath);
      wStream.on('close', function(){
        log.info('bundler', 'css compiled successfully');
        fulfill();
      });
      wStream.write(cssToWrite);
      wStream.close();
    });
  },

  addLessFile: function(filePath){
    if( Bundler.cssFilesToCompile.indexOf(filePath) === -1 ){
      Bundler.cssFilesToCompile.push(filePath);
      fs.readFile( path.join(filePath, 'style.less'), 'utf8', function(err, data){
        if(err){
          log.error('bundler', 'error reading less file', filePath);
        }
        var cssObj = {
          path: filePath + 'style.less',
          css: data
        };
        Bundler.cssToCompile.unshift(cssObj);
      });
    }
  },

  destroy: function(){
    Bundler.env = null;
    Bundler.dirPath = null;
    Bundler.cssToCompile = '';
    log.info('bundler', 'destroyed');
  }
};

//[TODO] implement Caching for when whatching
// * when a file is changed, test if replacing the contents inside the bundle
//   is faster than compiling the whole thing
//   * this goes for browserify and less