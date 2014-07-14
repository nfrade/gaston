var browserify = require('browserify')
	, log = require('npmlog')
	,	vfs = require('vinyl-fs')
	, through = require('through')
  , watch = require('./watch')
  , source = require('vinyl-source-stream')
  , path = require('path')
  , fs = require('graceful-fs')

 //  function prep (file, opts) { // ignores less files and remembers which js files to watch
 //    if (!/(\.less$)/.test(file) && !/(\.css$)/.test(file)){

	// 	}
 //    return through();
	// }

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

  
  var b = browserify('./' + path.normalize(buildFolder,indexFile))
    , file
    , deps
    , jsFiles = []

  function watchJS () {
    if (!dontwatch) watch(jsFiles, function(){
      module.exports(indexFile, debug, jsBuildFileName, buildFolder)
    })
  }

  function errorMessage ( error ) {
    var filename = buildFolder + jsBuildFileName
    writeError( filename, error )
  }

  b.deps().on('data',function(data){
      deps = data.deps
      for (file in deps) {
        if (/(\.js$)/.test(file)) {
          file = data.deps[file]
          log.info('compile-js', file)
          jsFiles.push(file)
        }else if (/(\.less$)|(\.css$)/.test(file)) {
          b = b.ignore(data.deps[file])
        }
      }
    }).on('end',function(){

    b.bundle({ debug: debug })
      .on('error',function(err, data){ 
        log.error('compile-js bundle',err)
        errorMessage(err)
        watchJS()
      })
      .pipe(source(jsBuildFileName))
      .on('data',function(data){ 
        log.info('compile-js source data',data)
      })
      .pipe(vfs.dest(buildFolder))
      .on('data',function(data){ 
        log.info('compile-js vfs data',data)
      })
      .on('end', function(){
        watchJS()
        if (callback) callback()
      })

    })

};