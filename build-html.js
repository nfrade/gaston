var fs = require('fs')

	, fileName = 'build.html'
	,	htmlName = 'index.html'
	,	jsName = 'bundle.js'
	, cssName = 'bundle.css'

	,	htmlString = fs.readFileSync('./index.html','utf8')
	, jsString = fs.readFileSync('./bundle.js','utf8')
	, cssString = fs.readFileSync('./bundle.css','utf8')

	,	stream = fs.createWriteStream(fileName)

function findJS (filename) {
	return new RegExp('<script[\\s\\S]{0,}'
		+ filename.replace(/\./g,'\\.')
		+'[\\s\\S]{0,}>([\\s\\S]*?)<\\/script>','i')
}

function findCSS (filename) {
return new RegExp('<link[\\s\\S]{0,30}href[\\s\\S]{0,5}=[\\s\\S]{0,5}[\'"]'
	+ filename.replace(/\./g,'\\.')
	+'[\'"][\\s\\S]{0,}>','i');
}

stream.once('open', function(fd) {
  var html = htmlString.replace(findJS(jsName),
  		'<script type=text/javascript>' + jsString + '</script>')
  	.replace(findCSS(cssName),
  		'<style media="screen" type="text/css">' + cssString + '</style>')

  console.log(html)
  stream.end(html);
});

//=====================

// module.exports = function(htmlFile,jsFile,cssFile) {
// 	// gulp.src(htmlFile)
// 	// 	.pipe(minifyHTML())
// 	// 	.pipe(rename(cssBuildFileName))
// 	// 	.pipe(filesize())
// 	// 	.pipe(gulp.dest(buildFolder));
// };