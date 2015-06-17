var cJSON = require('circular-json')
  , smapify = window.smapify = require('smapify')
  , oldConsole = window.oldConsole = window.console
  , sentMessages = []

console.info('taking over console');

window.console = {
  log: doConsole('log'),
  info: doConsole('info'),
  warn: doConsole('warn'),
  debug: doConsole('debug'),
  error: doError
};

function doError(){
  var args = Array.prototype.slice.call(arguments);
  var myArgs = [];
  for(var i = 0, l = args.length; i < l; i++){
    var arg = args[i];
    myArgs.push( arg instanceof Error? smapify.getStack(arg).stack : arg );
  }
  oldConsole.error.apply(oldConsole, myArgs);
}

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
    var stack = error.stack.split('\n');
    var smapy = smapify.getStackLine( stack[2] );
    var localArgs = Array.prototype.slice.call(arguments);
    // oldConsole[type].apply( oldConsole, localArgs.concat(['\n', smapy.stack]) );

    var payload = {
      $id: Math.floor( Math.random() * 999999 ),
      console: type,
      args: args,
      stack: smapy.stack
    };

    gaston.emit('browser-console', payload);
  };
};
