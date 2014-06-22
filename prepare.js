var fs = require('fs')

//work in progress!!

module.exports = function (rootFolder, htmlFile, cssFile, jsFile) {
	var files = fs.readdirSync(rootFolder)
		,	file

	for (var i = files.length - 1; i >= 0; i--) {
		file = files[i]
		if (~file.indexOf('.html')){
			console.log('found html file!',file)
			// if(/\.index$/i.test(file)){
			// 	console.log('>>>>',file)
			// }
		}
		if (~file.indexOf('.js')){
			console.log('found js file!',file)
		}
	}

}