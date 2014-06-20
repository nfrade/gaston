var gulp = require('gulp'),
  gutil = require('gulp-util'),
  connect = require('gulp-connect'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  uglify = require('gulp-uglify'),
  less = require('gulp-less'),
  path = require('path'),
  rename = require('gulp-rename'),
  streamify = require('gulp-streamify'),
  filesize = require('gulp-filesize'),

  jsFilesToWatch = '../V-browserfy/**/*.js',
  lessFilesToWatch = '../V-browserfy/**/*.less',
  rootFolder = '../V-browserfy/test',
  indexFile = rootFolder + '/index.js',

  buildFolder = rootFolder,
  jsBuildFileName = 'bundle.js',
  cssBuildFileName = 'bundle.css',
  exclude = '!'+ buildFolder + '/' + jsBuildFileName,
  
  port = 8080,
  livereload = false,
  debug = false,

  dependencyArray = [],

  checkArguments = function(){
    var processArgs = process.argv,
    i = processArgs.length;
    while(i--){
      if (~processArgs.indexOf('-port') || ~processArgs.indexOf('-p:'))
        port = Number(processArgs.slice(3));
      if (~processArgs.indexOf('-livereload') || ~processArgs.indexOf('-lr'))
        livereload = true;
      if (~processArgs.indexOf('-debug'))
        debug = true;
    };
  },

  listDependencies = function(dependancyObj){
    var deps = dependancyObj.deps,
      filePath,
      fileName,
      dependancy,
      str;

    for(filePath in deps){
      fileName = deps[filePath];
      dependancy = filePath + fileName.slice(fileName.lastIndexOf('/'),fileName.length);
      str = dependancy.split('//').join();
      if(!~dependencyArray.indexOf(str)){
        dependencyArray.push(str);
      }
    }
  };

gulp.task('webserver', function() {
  connect.server({
    root:rootFolder,
    port:port,
    livereload:livereload
  });
});

gulp.task('compileJs', function() {
  var b = browserify(indexFile);

  b.bundle({ debug: debug })
    .on('error', gutil.log)
    .pipe(source(jsBuildFileName))
    .pipe(streamify(uglify()))
    .pipe(streamify(filesize()))
    .pipe(gulp.dest(buildFolder));

  b.deps()
    .on('data', listDependencies);

});

gulp.task('compileLess', function () {
  gulp.src(lessFilesToWatch)
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(rename(cssBuildFileName))
    .pipe(filesize())
    .pipe(gulp.dest(buildFolder));
});

gulp.task('default', function() {

    checkArguments();

    gulp.start('compileJs')
      .start('compileLess')
      .start('webserver');

    gulp.watch([jsFilesToWatch,exclude], ['compileJs']);
    gulp.watch(lessFilesToWatch, ['compileLess']);

});