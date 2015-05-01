var program = require('commander')
  , gaston = require('../lib');

program
  .option( '-p, --port [port]', 'run server on port <port> ( default 8080 )', parseInt )
  .option( '-P, --path [path]', 'run server from path <path> ( default process.cwd() )' )
  .parse(process.argv);

var options = {
  port: program.port || 8080,
  path: program.path || process.cwd()
}

gaston.dev(options);