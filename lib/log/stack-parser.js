var SocketServer = require('../server/socket-server');

var Stack = module.exports = function(err){
  this.name = err.name;
  this.message = err.message;
  this.stack = err.stack;
  console.log(err.name);
  console.log(err.message);
  console.log('-------------------------');
  console.log(err.stack);
  console.log('\n-------------------------\n');
};

Stack.prototype.parse = function(){
  var self = this;
  return SocketServer.smcPromise  
    .then(function(smc){
      var stackArray = self.stack.split(' at ');
      var regex = /:(\d+):(\d+)/;
      var lines = [];
      for(var i = 0, l = stackArray.length; i < l; i++){
        var line = stackArray[i];
        var match = regex.exec(line);
        if(match){
          if( match[1] === '1'){
            break;
          }
          var funcName = line.substr(0, line.indexOf(' (')); 
          var origPosition = smc.originalPositionFor({
            line: parseInt(match[1], 10), 
            column: parseInt(match[2], 10)
          });
          origPosition.name = funcName || '(anonymous)';
          lines.push( origPosition );
        }
      }

      var stack = self.name + ': ' + self.message + '\n' ;
      for(var i = 0, l = lines.length; i < l; i++){
        var line = lines[i];
        if( line.name.indexOf('Object.require') === 0){
          line.name = '';
        }
        stack += '\tat ' + line.name + ' ( //' + line.source + ':' + line.line + ':' + line.column + ' )\n';
      }
      return stack;
    });

};

