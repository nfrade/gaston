var nodegit = require('nodegit')
  , backtrackFile = require('../backtrack-file');

module.exports = function(file, sha){
  var gitPath = backtrackFile('.git/');
  return nodegit.Repository.open( gitPath )
    .then( function(repo){
      if(sha === 'HEAD'){
        return repo.getBranchCommit('HEAD');
      } else {
        return repo.getCommit(sha);
      }
      
    } )
    .then(function(commit){
      return commit.getEntry(file)
    })
    .then(function(entry){
      return entry.getBlob();
    })
    .then(function(blob){
      return blob.toString()
    })
};