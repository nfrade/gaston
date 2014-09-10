var Server = require('./server')
  , _build = require('./build')
  , _compile = require('./compile')

module.exports = function(port, close, debug, build, nocss){
	var server = new Server({
		port: port
		, close: close
		, debug: debug
		, build: build
		, nocss: nocss
	})
	server.start()
}