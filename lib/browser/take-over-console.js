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

function doError(){
  var args = Array.prototype.slice.call(arguments);
  var myArgs = [], serverArgs = [], errorCount = 0;
  for(var i = 0, l = args.length; i < l; i++){
    var arg = args[i], serverArg = args[i];
    if(arg instanceof Error){
      serverArg = {
        name: arg.name,
        message: arg.message,
        stack: arg.stack
      }
      arg = smapify.getStack(arg).stack;
      errorCount++;
    }
    myArgs.push( arg );
    myArgs.push('\n');
    serverArgs.push( serverArg );
  }
  if(errorCount === 0){
    return doConsole('error', 3).apply(doConsole, arguments);
  }
  oldConsole.error.apply(oldConsole, myArgs);

  var payload = {
    args: serverArgs
  };

  gaston.emit('browser-error', payload);
}

function doErrorFromServer(payload){
  var myArgs = [];
  myArgs.push( 'error from ' + payload.client.id );
  for(var i = 0, l = payload.args.length; i < l; i++){
    var arg = payload.args[i];
    if( typeof arg === 'object' && !!arg.stack ){
      arg = stack = smapify.getStack( arg ).stack;
    }
    myArgs.push('\n');
    myArgs.push(arg);
  }
  oldConsole.error.apply(oldConsole, myArgs);
}

function doConsole(type, stackLineNr, fromServer){
  return function(){
    var myArgs = [], localArgs = [];
    var args = Array.prototype.slice.call(arguments);
    for(var i = 0, l = args.length; i < l; i++){
      var arg = args[i];
      localArgs.push(arg);
      localArgs.push('\n');
      if(typeof arg === 'object'){
        try{
          arg = JSON.parse( JSON.stringify( arg ) );
        } catch(ex){
          arg = JSON.parse( cJSON.stringify( arg ) );
        }
      }
      myArgs.push(arg);
      myArgs.push('\n');
    }
    var stack;
    

    var error = new Error();
    var localStack = error.stack.split('\n');
    stack = smapify.getStackLine( localStack[ stackLineNr || 2] ).stack;
    oldConsole[type].apply( oldConsole, localArgs.concat(stack) );

    var payload = {
      console: type,
      args: args,
      stack: stack
    };

    gaston.emit('browser-console', payload);
  };
};

function doConsoleFromServer(fromServer){
  var myArgs = fromServer.args;
  myArgs.unshift( 'from: ' + fromServer.client.id );
  myArgs.push(fromServer.stack);
  oldConsole[ fromServer.console ].apply(oldConsole, myArgs);
}

gaston.on('browser-console', function(payload){ 
  if(payload.client.id !== gaston.id){
    doConsoleFromServer(payload);
  }
});

gaston.on('browser-error', function(payload){ 
  if(payload.client.id !== gaston.id){
    doErrorFromServer(payload);
  }
});

