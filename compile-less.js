var browserify = require('browserify')
	,	fs = require('fs')
	,	cleanCSS = require('clean-css')
	,	less = require('less')
	, log = require('npmlog')
	, path = require('path')
  , watch = require('./watch')

module.exports = function (indexFile, cssBuildFileName, buildFolder) {
  var b = browserify(indexFile)
		, deps
		, file
		, lessFile
		, lessString
		, totalString = ''
		, rebasedLess
		, lessFiles = []

	b.deps()
		.on('error', function(err){
			log.error(err)
		})
		.on('data', function(data){
			deps = data.deps
			for (file in deps) {
				if (/(\.less$)|(\.css$)/.test(file)) {
					log.info('compile-less', file)
					lessFile = deps[file]
					lessFiles.push(lessFile)
					lessString = fs.readFileSync(lessFile,'utf8')
			    , rebasedLess = new cleanCSS({ // rebasing paths
			    	noAdvanced:true
			    }).minify(lessString)
			    , totalString += rebasedLess
				}
			}
		})
		.on('end',function(){
			if(lessFile) {
				less.render(totalString,function (e, css) {  // compile less to css
			      fs.writeFile(buildFolder + cssBuildFileName, css, function(err){
			          if (err) log.error('compile-less', err)
			      })
			  })
				watch(lessFiles, function(){
	    		module.exports(indexFile, cssBuildFileName, buildFolder)
	    	})
			}
		})
}
