var fs = require('graceful-fs') 
  , path = require('path')
  , less = require('less')
  , through = require('through2')
  , Watcher = require('../watcher')
  , Bundler = require('../')
  , config = require('../../config')
  , CSS_EXTENSIONS = ['.css', '.less', '.sass', '.scss']
  , appName = config.pkg.name
  , importRegExp = /@import(\ +)?url(\ +)?\((\ +)?['"](.+)?['"](\ +)?\)\;?/g
  , appRegExp = new RegExp('^' + appName + '\/')
  , tildeRegExp = new RegExp('^\~\/')

var Transform = module.exports = function(file, options){
  return through(function(buf, enc, next){

    if( !~CSS_EXTENSIONS.indexOf( path.extname(file) ) ){
      this.push(buf);
      return next();
    }

    var str = buf.toString('utf8');
    var match, importPath;

    while( match = importRegExp.exec(str) ){
      importPath = match[4].replace(appRegExp, config.basePath);
      importPath = importPath.replace(tildeRegExp, config.basePath);
      str = str.replace(match[0], '');
      if( !~Transform.imports.indexOf(importPath) ){
        Transform.imports.push(importPath);
      }
    }

    Transform.paths.push( path.dirname(file) );

    Transform.input.push( {
      src: file.replace(config.basePath, ''),
      input: str
    } );
    
    this.push(null);
    
    next();
  });
};

Transform.paths = [];
Transform.imports = [];
Transform.input = [];

Transform.render = function(){
  var input = Transform.input.reduce(function(a, b){
    return a + '\n/* ' + b.src + ' */\n' + b.input + '\n\n';
  }, '');

  for(var i = 0, len = Transform.imports.length; i < len; i++){
    input = '\n@import url("'+ Transform.imports[i] +'");\n\n' + input;
  }
  console.log('rendering......');
  return less.render(input, {paths: Transform.paths, compress: false});
};

