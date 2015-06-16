var SocketServer = require('../server/socket-server')
  , rex = /\"(.+)\"\:\[function\(require,module,exports\)\{/
  , countLines = 0 
  , smaps = module.exports.smaps = {};

module.exports.buildMaps = function(chunk){
  var data = chunk.toString('utf8');
  var lines = data.split('\n');
  var match = rex.exec( lines[0] );
  if(match){
    smaps[countLines +1] = match[1];
  }
  countLines += lines.length - 1;
};

module.exports.reset = function(){
  countLines = 0;
  smaps = module.exports.smaps = {};
};