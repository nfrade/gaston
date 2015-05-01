#!/usr/bin/env node
var commander = require('commander');

if (process.argv.indexOf('dev') === -1 && process.argv.indexOf('build') === -1) {
  process.argv.push('dev');
}

commander
  .version('0.5.0')
  .command('dev', 'run development environment')
  .command('build', 'build target')
  .parse(process.argv);

//listen for commands
if( ~process.argv.indexOf('dev') ){
  
  var stdin = process.openStdin();

  stdin.on('data', function(chunk) {
    var args = Array.prototype.slice.call(process.argv)
    command = chunk.toString();

    args.splice(2)

    if (command === 'build\n') {
      
      args.push('build');
      args.push('-k');

      commander.parse(args);

    } else {
      console.log('command not supported: ' + command);
    }
  });
}