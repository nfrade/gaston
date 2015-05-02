var build = require('./build');

module.exports = function(options){
  return function(chunk) {
    command = chunk.toString().replace('\n', '');
    switch(command){
      case 'build':
        build.run(options);
        break;
    }
  }
};