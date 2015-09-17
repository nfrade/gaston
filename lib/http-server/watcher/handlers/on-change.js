var onChange = module.exports = function onChange(Watcher){
  return function onChange(file){
    var io = require('../../../daemon').io;
    io.emit('reload');
  };
};