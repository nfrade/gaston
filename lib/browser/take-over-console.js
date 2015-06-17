var cJSON = require('circular-json')
  , oldConsole = window.oldConsole = window.console
  , sentMessages = []
  , queue = [];

console.info('taking over console');

window.console = {
  // log: oldConsole.log.bind(oldConsole),
  log: doConsole('log'),
  info: doConsole('info'),
  error: doConsole('error'),
  warn: doConsole('warn'),
  debug: doConsole('debug')
};
var i = 0;
function doConsole(type){
  return function(){

    if(!gaston.smaps){
      queue.push(arguments);
      return oldConsole[type].apply(oldConsole, arguments);
    }

    var args = Array.prototype.slice.call(arguments);
    for(var i = 0, l = args.length; i < l; i++){
      if(typeof args[i] === 'object'){
        try{
          args[i] = JSON.parse( JSON.stringify( args[i] ) );
        } catch(ex){
          args[i] = JSON.parse( cJSON.stringify( args[i] ) );
        }
      }
    }

    var error = new Error();
    var payload = {
      $id: Math.floor( Math.random() * 999999 ),
      console: type,
      args: args,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };

    var stack = error.stack.split('\n');
    var smapy = smapify( stack[2] );

    var localArgs = Array.prototype.slice.call(arguments);
    oldConsole[type].apply( oldConsole, localArgs.concat(['\n', smapy.stack]) );
    gaston.emit('browser-console', payload);
    
    sentMessages.push( payload.$id );
  };
};

var rex = /(http.+)bundle.js\:(\d+)\:(\d+)/
function smapify(stackLine){
  var match = rex.exec(stackLine);
  var url = match[1];
  var reqLine = parseInt( match[2], 10 );

  var keys = Object.keys(gaston.smaps);
  var result = {};
  for(var i = 0, l = keys.length; i < l; i++){
    if( keys[i] > reqLine ){
      var line = parseInt(keys[i-1], 10);
      result.source = gaston.smaps[ line ];
      result.line = reqLine - line;
      result.stack = '( at ' + url + result.source + ':' + result.line + ' )';
      break;
    }
  }
  // oldConsole.log(result, keys[i-1]);
  return result;
}

