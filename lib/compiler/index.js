var browserify = require('browserify')
  , less = require('less');

var Compiler = module.exports = {
  compileJS: function(dirPath, fileName, isNewFile){
    console.log('compiling JS', dirPath, fileName, isNewFile)
  }, 
  compileLess: function(dirPath, fileName, isNewFile){
    console.log('compiling CSS', dirPath, fileName, isNewFile);
  }
};