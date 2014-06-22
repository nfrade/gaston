var browserify = require('browserify')
	,	fs = require('fs')
	,	cleanCSS = require('clean-css')
	,	less = require('less')
	, log = require('npmlog')

module.exports = function (indexFile,cssBuildFileName,buildFolder) {
  var b = browserify(indexFile)
		, deps
		, i
		, lessFile
		, lessString
		, totalString = ''
		, rebasedLess

	b.deps()
		.on('error', function(err){
			log.error(err)
		})
		.on('data', function(a,b){
			deps = a.deps
			for (i in deps) {
				if (/(\.less$)|(\.css$)/.test(i)) {
					lessFile = deps[i]
					, lessString = fs.readFileSync(lessFile,'utf8')
			    , rebasedLess = new cleanCSS({ // rebasing paths
			    	noAdvanced:true
			    }).minify(lessString)
			    , totalString += rebasedLess
				}
			}
		})
		.on('end',function(){
			if(lessFile) less.render(totalString,function (e, css) {  // compile less to css
		      fs.writeFile(buildFolder + cssBuildFileName, css, function(err){
		          console.error('done compiling less\nerrors:',err);
		      })
		  })
		})
}
