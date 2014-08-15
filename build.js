var fs = require('graceful-fs')
	,	cleanCSS = require('clean-css')
	, uglify = require("uglify-js")
	, log = require('npmlog')
	, path = require('path')

function findJS (filename) {
	log.info('replace',filename)
	return new RegExp('<script[\\s\\S]{0,}'
		+ filename.replace(/\./g,'\\.')
		+'[\\s\\S]{0,}>([\\s\\S]*?)<\\/script>','i')
}

function findCSS (filename) {
	return new RegExp('<link[\\s\\S]{0,30}href[\\s\\S]{0,5}=[\\s\\S]{0,5}[\'"]'
		+ filename.replace(/\./g,'\\.')
		+'[\'"]([\\s\\S]*?)>','i');
}

module.exports = function(htmlFile, jsFile, cssFile, buildFile){

	var htmlString = fs.readFileSync(htmlFile,'utf8')
		, cssString = fs.readFileSync(cssFile,'utf8')
		, minimizedCSS = new cleanCSS().minify(cssString)
		, minimizedJS = uglify.minify(jsFile).code

	htmlString = htmlString.replace(findCSS(path.basename(cssFile))
		, '<style media="screen" type="text/css">' 
		+ minimizedCSS 
		+ '</style>')
			.replace(findJS(path.basename(jsFile))
				, '<script type=text/javascript>' 
				+ minimizedJS 
				+ '</script>')

	fs.writeFile(buildFile,htmlString,function(err){
		if(err) log.error(err)
		else log.info('build complete')
	})
}