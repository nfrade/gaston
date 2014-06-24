var connect = require('connect')
	, http = require('http')
	,	fs = require('fs')
	, app = connect()
	, log = require('npmlog')

module.exports = function( folder, port ){
	app.use(function(req, res){
		fs.readFile(process.cwd() + (req.url || '/index.html'), function(err, data){
			if (err) log.error('server', err)
				res.end(data);
		})
	  
	})
	http.createServer(app).listen(port || 8080)

}

