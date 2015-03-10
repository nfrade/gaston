var Server = require('./server')
  , compiler = require('./compile')

module.exports = exports = function(port, close, debug, build, nocss){
	var server = new Server({
		port: port
		, close: close
		, debug: debug
		, build: build
		, nocss: nocss
	})
	server.start()
}

exports.bundle = compiler.bundle