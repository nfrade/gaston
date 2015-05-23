var fs = require('graceful-fs') 
  , path = require('path')
  , through = require('through2')
  , Watcher = require('../watcher')
  , Bundler = require('../')
  , config = require('../../config')
  , CSS_EXTENSIONS = ['.css', '.less', '.sass', '.scss']
  , regExp = new RegExp('@import url(\\ +)?\\((\\ +)?\\\'' + config.pkg.name + '\\/', 'g');

    console.log('regexp ', regExp);

module.exports = function(file, options){
  return through(function(buf, enc, next){

    if( !~CSS_EXTENSIONS.indexOf( path.extname(file) ) ){
      this.push(buf);
      return next();
    }

    var str = buf.toString('utf8');

    str = str.replace(regExp, '@import url(\'' + config.basePath);
    
    this.push(str);
    
    next();
  });
};

