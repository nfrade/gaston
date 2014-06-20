var gulp = require('gulp'),

  //required directories
  webserver = require('./webserver'),
  compileJs = require('./compile-js'),
  compileLess = require('./compile-less'),

  //default sources (now set to testing)
  jsFilesToWatch = '../V-browserfy/**/*.js',
  lessFilesToWatch = '../V-browserfy/**/*.less',
  rootFolder = '../V-browserfy/test',
  indexFile = rootFolder + '/index.js',

  //default destinations
  buildFolder = rootFolder,
  jsBuildFileName = 'bundle.js',
  cssBuildFileName = 'bundle.css',
  exclude = '!'+ buildFolder + '/' + jsBuildFileName,
  
  //options
  port = 8080,
  livereload = false,
  debug = false,

  checkForOptions = function(){
    var processArgs = process.argv,
    i = processArgs.length;

    while(i--){
      if (~processArgs.indexOf('-port') || ~processArgs.indexOf('-p:'))
        port = Number(processArgs.slice(3));
      if (~processArgs.indexOf('-livereload') || ~processArgs.indexOf('-lr'))
        livereload = true;
      if (~processArgs.indexOf('-debug'))
        debug = true;
    }
  };

checkForOptions();

gulp.task('webserver', function(){
  console.error('doing webserver!')
  webserver(rootFolder,port,livereload)
});

gulp.task('compile-js', function(){
  console.error('doing compile-js!')
  compileJs(indexFile,debug,jsBuildFileName,buildFolder);
});

gulp.task('compile-less', function(){
  console.error('doing compile-less!')
  compileLess(indexFile,cssBuildFileName,buildFolder);
});

gulp.task('compile', ['compile-js','compile-less']);

gulp.task('default', function() {
    gulp.start('compile')
      .start('webserver');
});