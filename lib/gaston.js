var log = require('npmlog')
  , config = require('./config')
  , command = config.command;

switch(command){
  case 'help':
  case 'dev':
  case 'build':
    log.info('gaston', 'running ' + command);
    require('./commands/' + command)();
    break;
  default:
    log.error('gaston', command + ': no such command')
    log.info('gaston', 'type "gaston help" for help');
}







// if (process.argv.indexOf('dev') === -1 && process.argv.indexOf('build') === -1) {
//   process.argv.push('dev');
// }

// program
//   .version(pkg.version)
//   .command('init', 'bootstrap a project')
//   .command('dev', 'run development environment')
//   .command('build', 'build target')
//   .parse(process.argv);