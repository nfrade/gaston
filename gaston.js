var _server = require('./server')
  , _build = require('./build')
  , _compile = require('./compile')

module.exports = function(port, close, debug, build, nocss){
  _server(port, true, close, debug, build, nocss)
}