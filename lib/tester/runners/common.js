var phantomRunner = require('./phantom')
  , nodeRunner = require('./node'); 

var common = module.exports = function common(source, errors, dir){
  return phantomRunner(source, errors, 'common')
    .then(function(errors){
      return nodeRunner(source, errors, 'common')
    });
};