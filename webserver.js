var connect = require('connect')
	, http = require('http')
	,	fs = require('graceful-fs')
	, app = connect()
	, log = require('npmlog')
	, path = require('path')

module.exports = function( folder, port ){
	
	app.use(function(req, res){
		console.log(req.url)
		// if(!~req.url.indexOf(folder)) req.url = path.join(folder,req.url)

		var request = path.join(process.cwd(),req.url)
		
		if(!path.extname(request)) request = path.join(request,'index.html')

		fs.readFile(request, function(err, data){
			if (err) log.error('server',process.cwd(),'REQ',req.url,'REQUEAST',request) 
				res.end(data)
		})

	})

	http.createServer(app).listen(port || 8080)

}

