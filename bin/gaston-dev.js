var program = require('commander')
  , gaston = require('../lib')
  , build = require('./build');

program
  .option( '-p, --port [port]', 'run server on port <port> ( default 8080 )', parseInt )
  .option( '-P, --path [path]', 'run server from path <path> ( default process.cwd() )' )
  .parse(process.argv);

var options = {
  port: program.port || 8080,
  path: program.path || process.cwd()
}

gaston.dev(options);

//listen for commands
var stdin = process.openStdin();

stdin.on('data', function(chunk) {
  // var args = Array.prototype.slice.call(process.argv)
  command = chunk.toString();

  if (command === 'build\n') {
    build.run(program);
  }
});

process.on('SIGINT', function() {  
  console.log('\nGaston, out!');
  process.exit(0);
});