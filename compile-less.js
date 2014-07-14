var browserify = require('browserify')
	,	fs = require('graceful-fs')
	,	less = require('less')
	, log = require('npmlog')
	, path = require('path')
  , watch = require('./watch')
  , prepare = require('./prepare')
  , currentDir

function findImports (string, nested) { // add more import notations (less)
	var found = string.match(/@import([\s\S]*?)\((.*?)\);?/g)
		,	i = (found || []).length - 1
		, imports
		, files = []
		, file
		, from = path.relative(currentDir, nested)
		, to

	for (; i >= 0;){
		to = found[i--].match(/url\(("|')?(.*?)("|')?\)/)[2]
		file = path.join(from, to)
		if (fs.existsSync(file)){
			files = findFiles(file)
			log.info('@import', file)
		}
		else {
			log.error('can\'t find @import file', file)
		}
	}
	return files
}

function findFiles (file) {
	var string = fs.readFileSync(file, 'utf8')
		, imports = findImports(string, path.dirname(file))
		, files = [file].concat(imports)

	return files
}

function filesToString (files) {
	var string = ''
		,	str
		,	i = files.length - 1
		, file
		, cnt = 0
	for (; i >= 0;) {
		cnt++
		file = path.normalize(files[i--])
		str = fs.readFileSync(file, 'utf8').replace(/@import([\s\S]*?)\((.*?)\);?/g, '')
		string += rebasePaths(str, path.dirname(file))
	}
	return string
}

function rebasePaths (string, nested) {
	var found = string.match(/url\(([^@])("|')?(.*?)("|')?\)/g)
		,	from
		, to
		, i = (found||[]).length - 1
		, from = path.relative(currentDir, nested)
		,	replace

	for (; i >= 0;) {
		to = found[i--].match(/\(("|')?(.*?)("|')?\)/)[2]

		if(!(to.indexOf('data:') === 0 || /^https?:\/\//.test(to))){ // check if this is a file
			replace = path.join(from, to)
			string = string.replace(to, replace)
		}
	}
	return string
}

module.exports = function (indexFile, cssBuildFileName, buildFolder, callback, dontwatch) {
  currentDir = path.join(process.cwd(),buildFolder)

  var b = browserify('./' + path.normalize(buildFolder,indexFile))
  	.on('error', function(err){ log.error('compile-less browserify',err) })
		, deps
		, fl
		, file
		, files
		, string = ''
		, passedFiles = []

	compile()

	function compile (){

		b.deps()
      .on('error',function(err){
        log.info('compile-less ignoring:',err.filename)
        b = b.ignore(err.filename)
        compile()
      })
			.on('data', function(data){
				deps = data.deps
				for (file in deps) {
					if (/(\.less$)|(\.css$)/.test(file)) {
						file = data.deps[file]
						log.info('compile-less', file)
						files = findFiles(file)
						// push files into watch array, make sure no doubles
						for (var i = files.length - 1; i >= 0;i--) {
							fl = files[i]
							if(!~passedFiles.indexOf(fl)){
								passedFiles.unshift(fl)
							}
						}
					}
				}
			})
			.on('end',function(){
				if(passedFiles.length) {	
					string = filesToString(passedFiles) + string
					less.render(string,function (e, css) {  // compile less to css
							if (e) log.error('compile-less less render', e)
				      fs.writeFile(buildFolder + cssBuildFileName, css, function(err){
				          if (err) log.error('compile-less write file', err)
				      })
				  })
				  if(callback) callback()
				  if(!dontwatch) watch(passedFiles, function(){
			  		module.exports(indexFile, cssBuildFileName, buildFolder)
			  	})
				}
			})
	}
}
