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

  compile: function(cssCollection){
    log.info('Less Compiler', 'compiling CSS')
    var promises = [];
    for(var i = 0, len = cssCollection.length; i < len; i++){
      var cssObj = cssCollection[i];
      promises.push( less.render(cssObj.css, { debug: true, paths: [cssObj.path] }) );
    }

    return Promise.all(promises);
  },

  destroy: function(){
    Bundler = null;
    this.options = null;
  }
}