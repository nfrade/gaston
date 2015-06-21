var cJSON = require('circular-json')
  , smapify = window.smapify = require('smapify')
  , oldConsole = window.oldConsole = window.console;

console.info('taking over console');

window.console = {
  log: doConsole('log'),
  info: doConsole('info'),
  warn: doConsole('warn'),
  debug: doConsole('debug'),
  error: doError
};

function doError(fromServer){
  var args = Array.prototype.slice.call(arguments);
  var myArgs = [], errorCount = 0;
  for(var i = 0, l = args.length; i < l; i++){
    var arg = args[i];
    if(arg instanceof Error){
      arg = smapify.getStack(arg).stack;
      errorCount++;
    }
    myArgs.push( arg );
  }
  if(errorCount === 0){
    return doConsole('error', 3).apply(doConsole, arguments);
  }
  oldConsole.error.apply(oldConsole, myArgs);
}

function doConsole(type, stackLineNr, fromServer){
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
    var smapy = smapify.getStackLine( stack[ stackLineNr || 2] );
    var localArgs = Array.prototype.slice.call(arguments);
    oldConsole[type].apply( oldConsole, localArgs.concat(['\n', smapy.stack]) );

    var payload = {
      console: type,
      args: args,
      stack: smapy.stack
    };

    if(!fromServer){
      gaston.emit('browser-console', payload);
    }
  };
};

gaston.on('browser-console', function(payload){ 
  if(payload.client.id !== gaston.id){
    doConsole(payload.console, null, true)(payload.args);
  }
});

