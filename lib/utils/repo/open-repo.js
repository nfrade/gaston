var nodegit = require('nodegit')
  , backtrackFile = require('../backtrack-file');

module.exports = function(basePath){
  var gitPath = backtrackFile('.git/', basePath);
  return nodegit.Repository.open( gitPath );
}