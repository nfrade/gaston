var cJSON = require('circular-json')
  , smapify = window.smapify = require('smapify')
  , oldConsole = window.oldConsole = window.console
  , sentMessages = []
  , queue = [];

console.info('taking over console');

window.console = {
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
    var smapy = smapify.getStackLine( stack[2] );

    var localArgs = Array.prototype.slice.call(arguments);
    oldConsole[type].apply( oldConsole, localArgs.concat(['\n', smapy.stack]) );
    gaston.emit('browser-console', payload);
    
    sentMessages.push( payload.$id );
  };
};

var err = new Error();
err.name = 'TypeError';
err.message = 'variable is not defined';

var stack = smapify.getStack(err);
oldConsole.error(stack.stack)