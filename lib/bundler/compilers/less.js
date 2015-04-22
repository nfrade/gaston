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
      } 
    };
  },

  compile: function(cssCollection){
    log.info('Less Compiler', 'compiling CSS')
    var promises = [];
    for(var i = 0, len = cssCollection.length; i < len; i++){
      (function(cssObj){
        var importPath = cssObj.path.split(path.sep);
        importPath.pop();
        importPath = importPath.join(path.sep);
        var promise = less.render(cssObj.css, { debug: true, paths: [importPath] })
          .then(
            function(output){
              output.path = cssObj.path;
              return output;
            },
            function(err){
              log.error('less', err);
            }
          )
        promises.push( promise );
      })( cssCollection[i] );
    }

    return Promise.all(promises);
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