var browserify = require('browserify')
	,	fs = require('fs')
	, through = require('through')

	,	cleanCSS = require('clean-css')
	,	less = require('less')

module.exports = function (indexFile,cssBuildFileName,buildFolder) {
  var b = browserify(indexFile).on('error', function (err) {
	  	console.error('error:',err)
	  })
		, deps
		, i
		, lessFile
		, lessString
		, totalString = ''
		, rebasedLess

	b.deps()
		.on('data', function(a,b){
			deps = a.deps
			for (i in deps) {
				if (/\.(less)|(css)$/i.test(i)) {
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
		  less.render(totalString,function (e, css) {  // compile less to css
		      fs.writeFile(buildFolder+cssBuildFileName, css, function(err){
		          console.error('done compiling less\nerrors:',err);
		      })
		  })
		})
}
