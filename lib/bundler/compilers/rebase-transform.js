var fs = require('graceful-fs') 
  , path = require('path')
  , through = require('through2')
  , Watcher = require('../watcher')
  , Bundler = require('../')
  , config = require('../../config')
  , CSS_EXTENSIONS = ['.css', '.less', '.sass', '.scss']
  , regExpPkgName = new RegExp('@import url(\\ +)?\\((\\ +)?\\\'' + config.pkg.name + '\\/', 'g')
  , regExpTilde = new RegExp('@import url(\\ +)?\\((\\ +)?\\\'\\~\\/', 'g');


module.exports = function(file, options){
  return through(function(buf, enc, next){

    if( !~CSS_EXTENSIONS.indexOf( path.extname(file) ) ){
      this.push(buf);
      return next();
    }

    var str = buf.toString('utf8');

    str = str.replace(regExpPkgName, '@import url(\'' + config.basePath);
    str = str.replace(regExpTilde, '@import url(\'' + config.basePath);
    
    this.push(str);
    
    next();
  });
};

