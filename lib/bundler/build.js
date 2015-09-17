var path = require('path')
  , _ = require('lodash')
  , browserify = require('browserify')
  , uglifyJS = require('uglify-js')
  , uglifyCSS = require('uglifycss')
  , Blessify = require('gaston-blessify')
  , setAlias = require('./util/set-alias')

var build = module.exports = function build(){
  var self = this;
  var options = self.options;
  var blessify = self.blessify = new Blessify(options);

  var bOptions = {
    debug: false,
    cache: {},
    packageCache: {},
    fullPaths: true,
    noParse: []
  };

  return new Promise(function(resolve, reject){
    var b = browserify(options.source, bOptions);
    options.package && b.require( options.package, { expose: package.json });
    b.transform( blessify.transform, { global: true } );
    setAlias(b);
    var bundler = b.bundle( onComplete );

    function onComplete(err, buf){
      if(err){
        return reject(err);
      }
      var jsCode = buf.toString();
      var jsCode = uglifyJS.minify( jsCode, {fromString: true} );

      blessify.render()
        .then(function(output){
          var cssCode = uglifyCSS.processString(output.css);
          resolve({
            js: jsCode.code,
            css: cssCode
          });
        })
        .catch( reject );
    };
  });
};

