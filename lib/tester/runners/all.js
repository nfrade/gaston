var phantomRunner = require('./phantom')
  , nodeRunner = require('./node')
  , commonRunner = require('./common'); 

var all = module.exports = function all(source, errors, dir){
  var totalErrors = 0;

  return phantomRunner(source, errors)
    .then(function(errors){
      return nodeRunner(source, errors)
    })
    .then(function(errors){
      return commonRunner(source, errors)
    });
};