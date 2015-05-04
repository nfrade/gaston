var builder = require('./builder');

module.exports = function(options){
  return function(chunk) {
    command = chunk.toString().replace('\n', '');
    switch(command){
      case 'build':
        builder.run(options);
        break;
    }
  }
};