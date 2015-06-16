var path = require('path')
  , SocketServer = require('../server/socket-server')
  , Bundler = require('../bundler')
  , rex = /\"(.+)\"\:\[function\(require,module,exports\)\{/
  , countLines = 0 
  , smaps = module.exports.smaps = {};

module.exports.buildMaps = function(chunk){
  var data = chunk.toString('utf8');
  var lines = data.split('\n');
  var match = rex.exec( lines[0] );
  if(match){
    var file = match[1].replace(Bundler.dirPath + path.sep, '');
    smaps[countLines +1] = file;
  }
  countLines += lines.length - 1;
};

module.exports.reset = function(){
  countLines = 0;
  smaps = module.exports.smaps = {};
};

