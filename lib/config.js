var parseArgs = require('minimist')
  , args = parseArgs( process.argv.slice(2) )
  , backtrackFile = require('./utils/backtrack-file')
  , pkgPath = backtrackFile('package.json')
  , pkg = require(pkgPath)
  , gaston = pkg.gaston || {};

gaston.compilers = gaston.compilers || {};
var command = args._[0] || 'dev';

var config = module.exports = {
  pkgPath: pkgPath,
  pkg: pkg,
  gaston: gaston,
  command: command,
  isBuilding: command === 'build',
  basePath: pkgPath.replace('package.json', ''),
  port: args.p || args.port || gaston.port || 8080,
  socketPort: args.s || args['socket-port'] || gaston['socket-port'] || 9001,
  noAutoReload: args.r || args['no-auto-reload'] || gaston['no-auto-reload'] || false,
  lazyStart: args.l || args['lazy-start'] || gaston['lazy-start'] || false,
  // [TODO: no-package will be read from pkg.gaston['dev'||'build'] depending on the task being run ]
  noPackage: args.j || args['no-package'] || gaston['no-package'] || false,
  jsCompiler: gaston.compilers.js || 'browserify',
  cssCompiler: gaston.compilers.css || 'less'
};

