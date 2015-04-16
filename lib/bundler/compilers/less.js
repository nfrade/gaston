var log = require('npmlog')
  , fs = require('graceful-fs')
  , Promise = require('promise')
  , less = require('less')
  , Bundler

var Compiler = module.exports = {
  options: undefined,

  setup: function(bundler){
    Bundler = bundler;
    Compiler.options = { 
      sourceMap: {
        sourceMapFileInline: true
      } 
    };
  },

  compile: function(){
    return new Promise(function(fulfill, reject){
      log.info('Less Compiler', 'compiling CSS')
      //Compile the whole less
      less.render(Bundler.cssToCompile)
        .then(function(output){
          var fileName = Bundler.env === 'dev'? 'bundle.css' : 'bundle.min.css';
          var filePath = Bundler.dirPath + fileName;
          fs.writeFile(filePath, output.css, 'utf8', function(err){
            if(err){
              log.error('less', err);
              return reject(err);
            }
            log.info('less', 'CSS compiled successfully');
            fulfill();
          })
        });
    });
  },

  destroy: function(){
    Bundler = null;
    this.options = null;
  }
}