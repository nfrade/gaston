var SocketServer = require('../server/socket-server');

var Stack = module.exports = function(err){
  this.name = err.name;
  this.message = err.message;
  this.stack = err.stack;
};

Stack.prototype.parse = function(){
  var self = this;
  return SocketServer.smcPromise  
    .then(function(smc){

      var regex = /:(\d+):(\d+)/g
        , stack = self.name + ': ' + self.message + '\n'
        , match

      while( match = regex.exec( self.stack ) ){
        if(match[1] === '1'){
          break;
        }
        var pos = smc.originalPositionFor({
          line: parseInt(match[1], 10), 
          column: parseInt(match[2], 10)
        });
        stack += '\t @//'+ pos.source + ':' + pos.line + ':' + pos.column + '\n';
      }

      return stack;
    });

};

