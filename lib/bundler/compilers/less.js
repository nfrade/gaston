var log = require('npmlog')
  , fs = require('graceful-fs')
  , denodeify = require('denodeify')
  , Promise = require('promise')
  , readFile = denodeify( fs.readFile )
  , path = require('path')
  , less = require('less')
  , Watcher = require('../watcher')
  , Bundler = require('../')
  , config = require('../../config')

var Compiler = module.exports = {
  options: undefined,

  setup: function(){
    Compiler.options = {
      strictMath: true,
      sourceMap: {
        sourceMapFileInline: true
      },
      paths: []
    };
  },

  compile: function(cssFileMappings){
    log.info('less', 'compiling CSS')
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
        if( Compiler.options.paths.indexOf(cssObj.basePath) === -1 ){
          Compiler.options.paths.push(cssObj.basePath);
        }
        var promise = readFile(cssObj.cssPath, 'utf8')
          .then(function(data){
            cssObj.input = data;
            return cssObj;
          });
        promises.push(promise);
      });
    });

    return Promise.all(promises)
      .then(function(totalFiles){
        Bundler.cssFilesToCompile = Array.prototype.slice.call(totalFiles);
        return totalFiles.reduce(function(a, b){
          return a + b.input + '\n';
        }, '')
      })
      .then( rebaseURLs )
      .then(function(allCSS){
        return less.render(allCSS, Compiler.options);
      })
      .then(function(output){
        if(!Bundler.isBuilding){
          for(var i = 0, len = output.imports.length; i < len; i++){
            // Watcher.addWatcher( output.imports[i] );
          }
        }
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
};

var rebaseURLs = function(allCss){
  var rex = new RegExp('url(\\ +)?\\((\\ +)?[\'"]('+config.pkg.name+')\/(.+)[\'"](\\ +)?\\)', 'g');
  return allCss.replace(rex, 'url("$4")');
};


