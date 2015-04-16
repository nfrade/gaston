var log = require('npmlog')
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
      less.render(lessToRender)
        .then(function(output){
            fulfill(output);
          });
    });
  },

  destroy: function(){
    Bundler = null;
    this.options = null;
  }
}