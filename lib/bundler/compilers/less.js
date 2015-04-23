var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
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
      },
      paths: []
    };
  },

  compile: function(cssCollection){
    log.info('Less Compiler', 'compiling CSS')
    var lessToCompile = ''
      , importPaths = [];
    for(var i = 0, len = cssCollection.length; i < len; i++){
      (function(cssObj){
        var importPath = cssObj.path.split(path.sep);
        importPath.pop();
        Compiler.options.paths.push( importPath.join(path.sep) );
        lessToCompile += cssObj.css;
        Bundler.Watcher.addWatcher(cssObj.path);
      })( cssCollection[i] );
    }

    return less.render(lessToCompile, Compiler.options)
      .then(
        function(output){
          for(var i = 0, len = output.imports.length; i < len; i++){
            Bundler.Watcher.addWatcher( output.imports[i] );
          }
          return output.css;
        },
        function(err){
          log.error('less', err);
        }
      );
  },

  compileFile: function(filePath){
    return new Promise(function(fulfill, reject){
      fs.readFile(filePath, 'utf8', function(err, data){
        if(err){
          log.error('less', err);
          return reject(err);
        }
        fulfill(data);
      });
    });
  },

  destroy: function(){
    Bundler = null;
    this.options = null;
  }
}