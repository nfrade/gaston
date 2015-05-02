var openRepo = require('./open-repo');

module.exports = function(file, sha){
  return openRepo()
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