var phantomRunner = require('./phantom')
  , nodeRunner = require('./node'); 

var common = module.exports = function(source, errors, dir){
  var totalErrors = 0;
  return phantomRunner(source, errors, 'common')
    .then(function(errors){
      return nodeRunner(source, totalErrors, 'common')
    });
};