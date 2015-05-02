var nodegit = require('nodegit')
  , backtrackFile = require('../backtrack-file');

module.exports = function(){
  var gitPath = backtrackFile('.git/');
  return nodegit.Repository.open( gitPath );
}