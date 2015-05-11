var log = require('npmlog')
  , fs = require('graceful-fs')
  , denodeify = require('denodeify')
  , Promise = require('promise')
  , readFile = denodeify( fs.readFile )
  , path = require('path')
  , less = require('less')
  , Bundler

var Compiler = module.exports = {
  options: undefined,

  setup: function(bundler){
    Bundler = bundler;
    Compiler.options = {
      strictMath: true,
      sourceMap: {
        sourceMapFileInline: true
      },
      paths: []
    };
  },

  compile: function(cssFileMappings){
    var promises = [];

    if(Bundler.building){
      Compiler.options.compress = true;
      Compiler.options.sourceMap = null;
    } else {
      Compiler.options.sourceMap = { sourceMapFileInline: true };
      Compiler.options.compress = false;
    }

    Object.keys(cssFileMappings).forEach(function(jsPath){
      var cssArray = [].concat(cssFileMappings[jsPath]);
      cssArray.forEach(function(cssObj){
        var exists = fs.existsSync(cssObj.cssPath);
        if(exists){
          if( Compiler.options.paths.indexOf(cssObj.basePath) === -1 ){
            Compiler.options.paths.push(cssObj.basePath);
          }
          var promise = readFile(cssObj.cssPath, 'utf8')
            .then(function(data){
              cssObj.input = data;
              return cssObj;
            });
          promises.push(promise);
        }
      });
    });

    return Promise.all(promises)
      .then(function(totalFiles){
        Bundler.cssFilesToCompile = Array.prototype.slice.call(totalFiles);
        return totalFiles.reduce(function(a, b){
          return a + b.input + '\n';
        }, '')
      })
      .then(function(allCSS){
        return less.render(allCSS, Compiler.options);
      })
      .then(function(output){
        return output.css;
      })
      .catch(function(err){
        log.info('less', err);
      });
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