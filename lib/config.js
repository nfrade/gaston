var fs = require('graceful-fs')
  , parseArgs = require('minimist')
  , args = parseArgs( process.argv.slice(2) )
  , backtrackFile = require('./utils/backtrack-file')
  , pkgPath = backtrackFile('package.json');

var command = args._[0] || 'dev';

var config = module.exports = {
  command: command,
  isBuilding: command === 'build',
  basePath: process.cwd()
};

if(pkgPath){
  config.pkgPath = pkgPath,
  config.pkg = require(pkgPath);
  var gaston = config.pkg.gaston || {};
  config.gaston = gaston;
  config.basePath = pkgPath.replace('package.json', '');
  config.port = args.p || args.port || gaston.port || 8080,
  config.socketPort = args.s || args['socket-port'] || gaston['socket-port'] || 9001,
  config.noAutoReload = args.r || args['no-auto-reload'] || gaston['no-auto-reload'] || false,
  config.lazyStart = args.l || args['lazy-start'] || gaston['lazy-start'] || false,
  // [TODO: no-package will be read from pkg.gaston['dev'||'build'] depending on the task being run ]
  config.noPackage = args.j || args['no-package'] || gaston['no-package'] || false,
  gaston.compilers = gaston.compilers || {};
  config.jsCompiler = gaston.compilers.js || 'browserify',
  config.cssCompiler = gaston.compilers.css || 'less',
  config.bundle = gaston.bundle || 'dist/',
  config.build = gaston.build || 'dist/'
}


