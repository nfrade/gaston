var browserify = require('browserify')
	, log = require('npmlog')
	,	vfs = require('vinyl-fs')
	, through = require('through')
  , watch = require('./watch')
  , source = require('vinyl-source-stream')
  , path = require('path')
  , fs = require('fs')
  , jsFiles = []

  function handler (file, opts) { // ignores less files and remembers which js files to watch
		var input = ''
		if (/(\.js$)/.test(file)){
      file = path.relative(process.cwd(), file)
			log.info('compile-js', file)
			jsFiles.push(file);
			return through();
		}
		function write( data ) { input += data; }
		function end() { this.queue(null); }
		return through(write,end);
	}

  function writeError ( filename , error ){
    var text = 'document.write("<h1>Error compiling js:</h1> '+ error +'");'
    fs.writeFile(
      filename,
      text, 
      function(err){
        if (err) log.error('error write')
        log.info('reported error')
    })
  }

module.exports = function( indexFile
  , debug
  , jsBuildFileName 
  , buildFolder
  , callback
  , dontwatch) {

  function watchJS () {
    if (!dontwatch) watch(jsFiles, function(){
      module.exports(indexFile, debug, jsBuildFileName, buildFolder)
    })
  }

  function errorMessage ( error ) {
    var filename = buildFolder + jsBuildFileName
    writeError( filename, error )
  }
  
  var b = browserify(buildFolder + indexFile)
    .on('error',function(err){ 
      log.error('compile-js browserify',err)
      errorMessage(err)
      watchJS()
    })
		.transform({ relativeUrls: true, rootpath: buildFolder }, handler)
    .on('error',function(err){ 
      log.error('compile-js transform',err)
      errorMessage(err)
      watchJS()
    })
		.bundle({ debug: debug })
    .on('error',function(err, data){ 
      log.error('compile-js bundle',err)
      errorMessage(err)
      watchJS()
    })
		.pipe(source(jsBuildFileName))
		.pipe(vfs.dest(buildFolder))
    .on('end', function(){
      watchJS()
      if (callback) callback()
    	jsFiles = []
		})

};