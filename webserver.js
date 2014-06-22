var gulp = require('gulp')
	,	connect = require('gulp-connect')

module.exports = function(rootFolder,port,livereload) {
	  connect.server({
	    root:rootFolder,
	    port:port,
	    livereload:livereload
	  });

		return connect

	  //todo for livereload later!
	  
	  // gulp.watch(['./app/*.html'], function(){
		 //  gulp.src('./app/*.html')
		 //    .pipe(connect.reload());
	  // });
};
