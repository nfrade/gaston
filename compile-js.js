var browserify = require('browserify')
	, filesize = require('gulp-filesize')
	, gulp = require('gulp')
	, gutil = require('gulp-util')
	, log = require('npmlog')
  , source = require('vinyl-source-stream')
  , streamify = require('gulp-streamify')
	, through = require('through')
  , jsFiles = [];

  function handler (file, opts) { // ignores less files and remembers which js files to watch
		var input = '';
		log.info(file);
		if (/\.(less)|(css)$/i.test(file) === false){
			jsFiles.push(file);
			return through();
		}
		function write(data) { input += data; }
		function end() { this.queue(null); }
		return through(write,end);
	};

module.exports = function(indexFile,debug,jsBuildFileName,buildFolder) {
  var b = browserify(indexFile)
  	.on('error', gutil.log);

  b.transform({ relativeUrls: true, rootpath: buildFolder }, handler)
		.bundle({ debug: debug })
    .pipe(source(jsBuildFileName))
    .pipe(streamify(filesize()))
    .pipe(gulp.dest(buildFolder))
    .on('end',function(){
			gulp.watch(jsFiles, function(){
				module.exports(indexFile,debug,jsBuildFileName,buildFolder);
			});
		});

};