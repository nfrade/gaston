var cJSON = require('circular-json')
  , smapify = window.smapify = require('smapify')
  , oldConsole = window.oldConsole = window.console;

console.info('taking over console');

window.console = {
  log: doConsole('log'),
  info: doConsole('info'),
  warn: doConsole('warn'),
  debug: doConsole('debug'),
  error: doError()
};

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

function doError(fromServer){
  return function(){
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
  };
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
    var stack;
    var localArgs = Array.prototype.slice.call(arguments);

    if(fromServer){
      localArgs.unshift( 'from: ' + fromServer.client.id );
      // localArgs = ['from: ' + fromServer.client.id].concat(localArgs);
      stack = fromServer.stack;
    } else {
      var error = new Error();
      var localStack = error.stack.split('\n');
      stack = smapify.getStackLine( localStack[ stackLineNr || 2] ).stack;
    }
    oldConsole[type].apply( oldConsole, localArgs.concat(['\n', stack]) );

    var payload = {
      console: type,
      args: args,
      stack: stack
    };

    if(!fromServer){
      gaston.emit('browser-console', payload);
    }
  };
};

gaston.on('browser-console', function(payload){ 
  if(payload.client.id !== gaston.id){
    doConsole(payload.console, null, payload)(payload.args);
  }
});

gaston.on('browser-error', function(payload){ 
  if(payload.client.id !== gaston.id){
    // doError(payload)(payload.args);
    doErrorFromServer(payload);
  }
});

