var gaston = require('../../')

var config = module.exports = function config(args){
  var options = {
    key: args._[1],
    val: args._[2]
  };
  return gaston.config(options);
};