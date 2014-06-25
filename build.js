var fs = require('graceful-fs')
	,	cleanCSS = require('clean-css')
	, uglify = require("uglify-js")
	, fileName = 'build.html'
	,	htmlName = 'index.html'

function findJS (filename) {
	return new RegExp('<script[\\s\\S]{0,}'
		+ filename.replace(/\./g,'\\.')
		+'[\\s\\S]{0,}>([\\s\\S]*?)<\\/script>','i')
}

function findCSS (filename) {
	return new RegExp('<link[\\s\\S]{0,30}href[\\s\\S]{0,5}=[\\s\\S]{0,5}[\'"]'
		+filename.replace(/\./g,'\\.')
		+'[\'"]([\\s\\S]*?)>','i');
}

module.exports = function(buildFolder, jsBuildFileName, cssBuildFileName){
	var htmlString = fs.readFileSync(buildFolder + htmlName,'utf8')
		, cssString = fs.readFileSync(buildFolder + cssBuildFileName,'utf8')
		, minimizedCSS = new cleanCSS().minify(cssString)
		, minimizedJS = uglify.minify(buildFolder + jsBuildFileName).code

	fs.createWriteStream(fileName)
		.end(htmlString
			.replace(findCSS(cssBuildFileName)
				, '<style media="screen" type="text/css">' 
				+ minimizedCSS 
				+ '</style>')
			.replace(findJS(jsBuildFileName)
				, '<script type=text/javascript>' 
				+ minimizedJS 
				+ '</script>')
		)
}