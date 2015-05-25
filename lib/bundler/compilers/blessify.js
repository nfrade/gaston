var path = require('path')
  , less = require('less')
  , through = require('through2')
  , CSS_EXTENSIONS = ['.css', '.less', '.sass', '.scss']
  , importRegExp = /@import(\ +)?url(\ +)?\((\ +)?['"](.+)?['"](\ +)?\)\;?/g
  , requireRegExp = /require(\ +)?\((\ +)?['"](.+)?['"](\ +)?\)\;?/g
  , tildeRegExp = new RegExp('^\~\/')
  , appRegExp

var Transform = module.exports = function(file, options){ 
  return through(function(buf, enc, next){
    var str = buf.toString('utf8');
    var ext = path.extname(file);

    if( !~CSS_EXTENSIONS.indexOf( ext ) ){
      if(ext === '.js'){
        
      }

      return ( this.push(buf) && next() );
    }

    var match, importPath;

    while( match = importRegExp.exec(str) ){
      appRegExp = appRegExp || new RegExp('^' + options.appName + '\/');
      importPath = match[4].replace(appRegExp, options.basePath);
      importPath = importPath.replace(tildeRegExp, options.basePath);
      str = str.replace(match[0], '');
      if( !~Transform.imports.indexOf(importPath) ){
        Transform.imports.push(importPath);
      }
    }

    Transform.paths.push( path.dirname(file) );

    Transform.input = Transform.input.filter(function(item){
      return item.src !== file;
    });

    Transform.input.push( {
      src: file,
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
  // console.log(Transform.input);
  return less.render(input, {paths: Transform.paths, compress: false});
};


