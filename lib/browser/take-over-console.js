var cJSON = require('circular-json')
  , oldConsole = window.oldConsole = window.console
  , sentMessages = [];

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
    oldConsole[type].apply(oldConsole, args);
    gaston.emit('browser-console', payload);
    var stack = error.stack.split('\n');
    oldConsole.log(error.stack);
    // oldConsole.log(stack[2]);
    sentMessages.push( payload.$id ); oldConsole.log('sentMessages', sentMessages.length)
  };
};

