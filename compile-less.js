var gulp = require('gulp')
	, gutil = require('gulp-util')
	, filesize = require('gulp-filesize')
	, less = require('gulp-less')
	, path = require('path')
	, rename = require('gulp-rename')
	, browserify = require('browserify')
	, through = require('through')

	, lessAndCssFiles = [];

module.exports = function (indexFile,cssBuildFileName,buildFolder) {
  var b = browserify(indexFile)
		.on('error', gutil.log);

	b.deps()
		.on('data', function(a){
			var deps = a.deps,
				i,
				lessFile;

			for (i in deps) {
				if (~i.indexOf('.less') || ~i.indexOf('.css')) {
					lessFile = deps[i];
					lessAndCssFiles.push(lessFile);
					gulp.src(lessFile)
						.pipe(less())
						.pipe(rename(cssBuildFileName))
						.pipe(filesize())
						.pipe(gulp.dest(buildFolder));
				}
			}

		})
		.on('end', function(){
			gulp.watch(lessAndCssFiles, function(){
				module.exports(indexFile,cssBuildFileName,buildFolder);
			});
		});
};

