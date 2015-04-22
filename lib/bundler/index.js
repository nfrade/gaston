var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , promise = require('Promise')
  , browserify = require('browserify')
  , less = require('less');

var styleRegExp = /\/.+\.less$/;

var Bundler = module.exports = {
  env: undefined,
  dirPath: undefined,
  compilerPromise: undefined,
  cssToCompile: [],

  setup: function(options){
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
      .then(function(cssArray){
        return new Promise(function(fulfill, reject){
          var cssToWrite = cssArray.reduce(function(a,b){
            return a + b.css + '\n';
          }, '');
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
      })
      .then(function(){
        log.info('bundler', 'compilation process finished successfully');
        log.info('', '-----------------------------------------------------------');
      }).catch(function(err){
        log.err('bundler', err)
      });
    return Bundler.compilerPromise;
  },

  addLessFile: function(path){
    fs.readFile(path + 'style.less', 'utf8', function(err, data){
      if(err){
        log.error('bundler', 'error reading less file', path);
      }
      var cssObj = {
        path: path,
        css: data
      };
      Bundler.cssToCompile.unshift(cssObj);
    })

    return;

    return new Promise(function(fulfill, resolve){
      fs.readFile(path, 'utf8', function(err, data){
        if(err){
          log.error('bundler', 'error reading less file', path);
        }
        Bundler.cssToCompile += '/* ['+path+'] */\n';
        Bundler.cssToCompile += data + '\n';
      });
    });
  },

  injectFile: function(fullPath){
    switch( path.extname(fullPath) ){
      case '.js': 
        Bundler.jsCompiler.injectFile(fullPath);
        break;
      case '.less':
        Bundler.cssCompiler.injectFile(fullPath);
        break;
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