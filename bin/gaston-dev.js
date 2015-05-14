var program = require('commander')
  , gaston = require('../lib');

program
  .option( '-i, --no-inject-package ', 'don\'t inject package.json')
  .option( '-l, --lazy-start', 'don\'t launch or reload page when starting')
  .option( '-p, --port [port]', 'run server on port <port> ( default 8080 )', parseInt )
  .option( '-P, --path [path]', 'run server from path <path> ( default process.cwd() )' )
  .option( '-r, --reload [reload]', 'auto-reload on recompiling')
  .parse(process.argv);

var options = {
  port: program.port || 8080,
  path: program.path || process.cwd() + '/',
  autoreload: program.reload === 'false'? false : true,
  injectPackage: program.injectPackage,
  lazyStart: program.lazyStart
};

gaston.dev(options)

process.on('SIGINT', function() {
  console.log('\nGaston, out!');
  process.exit(0);
});

//[TODO] implement this:
program.on('help', function(){
  console.log('When running gaston dev type "help" to see available commands');
});