var phantomRunner = require('./phantom')
  , nodeRunner = require('./node'); 

var common = module.exports = function common(options, errors, dir){
  return phantomRunner(options, errors, 'common')
    .then(function(errors){
      return nodeRunner(options, errors, 'common')
    });
};