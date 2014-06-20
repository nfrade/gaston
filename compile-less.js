var gulp = require('gulp'),
	filesize = require('gulp-filesize'),
	less = require('gulp-less'),
	path = require('path'),
	rename = require('gulp-rename'),
	browserify = require('browserify'),
	through = require('through'),

	lessFiles = [];

module.exports = function (indexFile,cssBuildFileName,buildFolder) {
	browserify(indexFile).deps()
		.on('data', function(a){
			var deps = a.deps,
				i,
				lessFile;

			for(i in deps){
				if(~i.indexOf('.less')){
					lessFile = deps[i];
					lessFiles.push(lessFile);
					gulp.src(lessFile)
					.pipe(less({
						paths: [ path.join(__dirname, 'less', 'includes') ]
					}))
					.pipe(rename(cssBuildFileName))
					.pipe(filesize())
					.pipe(gulp.dest(buildFolder));
				}
			}
		})
		.on('end', function(){
			gulp.watch(lessFiles, function(){
				module.exports(indexFile,cssBuildFileName,buildFolder);
			});
		});
};