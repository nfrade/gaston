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
	  fs.writeFile(folder + 'index.html', data, function(err){
	      if (err) log.error('html write', err)
	      log.info('created file','index.html')
    	if( callbackFn ) {
    		log.warn('callback html')
    		callbackFn()
    	}
	  })
	})
}

function createJS ( folder, callbackFn ) {
  fs.writeFile(folder + 'index.js', '', function(err){
      if (err) log.error('js write', err)
      log.info('created file','index.js')
    	if( callbackFn ) {
    		log.warn('callback js')
    		callbackFn()
    	}
  })
}

function createCSS ( folder, callbackFn ) {
  fs.writeFile(folder + 'style.less', '', function(err){
      if (err) log.error('less write', err)
      log.info('created file','style.less')
    	if( callbackFn ) {
    		log.warn('callback css')
    		callbackFn()
    	}
  })
}

module.exports = function ( rootFolder, callback ) {

	var folder = rootFolder || './'
    ,	files = fs.readdirSync(folder)
		, file
		, haveStyle = haveIndexHTML = haveIndexJS = false
		, i = files.length
		, readyCount = 3
		, callbackFn = callback && function () { 
			if(!(--readyCount)){
				callback()
				log.warn('doing actual callback')
			} 
		} 
	
	while (i--) {
		file = files[i]
		if ( path.extname(file) === '.html' ) log.info('found html file!',file)	
		if ( path.extname(file) === '.js' ) log.info('found js file!',file)
		if ( path.extname(file) === '.less' ){
			log.info('found less file!',file)
			haveStyle = true
		}
		if ( path.extname(file) === '.css' ){
			log.info('found css file!',file)
			haveStyle = true
		}
		if ( path.basename(file) === 'index.html' ){
			log.info('found index.html file!',file)
			haveIndexHTML = true
		}
		if ( path.basename(file) === 'index.js' ){
			log.info('found index.js file!',file)
			haveIndexJS = true
		}
	}

	readyCount -= (haveStyle + haveIndexHTML + haveIndexJS)

	if( !haveIndexHTML ) createHTML( folder,false, callbackFn ) 
	if( !haveIndexJS ) createJS( folder,callbackFn )
	if( !haveStyle ) createCSS( folder,callbackFn )
	if( !readyCount ) callback()
}