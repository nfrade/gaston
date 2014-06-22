var browserify = require('browserify')
	, log = require('npmlog')
	,	vfs = require('vinyl-fs')
	, through = require('through')
  , watch = require('./watch')
  , source = require('vinyl-source-stream')
  , path = require('path')
  , fs = require('fs')
  , jsFiles = []
  , input

  function handler (file, opts) { // ignores less files and remembers which js files to watch
		input = ''
		if (/(\.js$)/.test(file)){
			log.info('compile-js', path.relative(process.cwd(), file))
			jsFiles.push(file);
			return through();
		}
		function write(data) { input += data; }
		function end() { this.queue(null); }
		return through(write,end);
	};

module.exports = function(indexFile,debug,jsBuildFileName,buildFolder) {
  var b = browserify(indexFile)
		.transform({ relativeUrls: true, rootpath: buildFolder }, handler)
		.bundle({ debug: debug })
		.pipe(source(jsBuildFileName))
		.pipe(vfs.dest(buildFolder))
    .on('end', function(){
			watch(jsFiles, function(){
    		module.exports(indexFile, debug, jsBuildFileName, buildFolder)
    	})
    	jsFiles = []
		})

};