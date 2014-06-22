var fs = require('fs')
	,	path = require('path')
	, log = require('npmlog')

function createHTML ( folder,templateName, callbackFn ) {

	var template = templateName || 'default.html'
		,	templatFolder = 'templates'
		, dir = __dirname
		, templateFile = path.join(dir, templatFolder, template)
		,	htmlTemplate = fs.readFileSync(templateFile,'utf8')

	fs.readFile(templateFile, function(err, data){
		if (err) log.error('html read', err)
			log.warn(folder)
	  fs.writeFile(folder + 'index.html', data, function(err){
	      if (err) log.error('html write', err)
	      log.info('created file','index.html')
	    	if( callbackFn ) callbackFn()
	  })
	})
}

function createJS ( folder, callbackFn ) {
  fs.writeFile(folder + 'index.js', '', function(err){
      if (err) log.error('js write', err)
      log.info('created file','index.js')
    	if( callbackFn ) callbackFn()
  })
}

module.exports = function ( rootFolder, callback ) {

	var folder = rootFolder || './'
    ,	files = fs.readdirSync(folder)
		, file
		, haveIndexHTML
		, haveIndexJS
		, i = files.length
		, readyCount = 2
		, callbackFn = callback && function () { if(!(--readyCount)) callback() } 
	
	while (i--) {
		file = files[i]
		if ( path.extname(file) === '.html' ){
			log.info('found html file!',file)
		}
		if ( path.basename(file) === 'index.html' ){
			log.info('found index.html file!',file)
			haveIndexHTML = true
			readyCount -= 1
		}		
		if ( path.extname(file) === '.js' ){
			log.info('found js file!',file)
		}
		if ( path.basename(file) === 'index.js' ){
			log.info('found index.js file!',file)
			haveIndexJS = true
			readyCount -= 1
		}
	}

	if( !haveIndexHTML ) createHTML( folder,false, callbackFn ) 
	if( !haveIndexJS ) createJS( folder,callbackFn )
	if( !readyCount ) callback()
}