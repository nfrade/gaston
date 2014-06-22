var gulp = require('gulp')
	,	connect = require('gulp-connect')

//no need for gulp! make own server

module.exports = function(rootFolder,port,livereload) {
  connect.server({
    root:rootFolder,
    port:port,
    livereload:livereload
  });
};