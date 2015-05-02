var openRepo = require('./open-repo');

module.exports = function(){
    return openRepo()
      .then(function(repo){
        return repo.getCurrentBranch()
      })
      .then(function(branch){
        return branch.name().split('/').pop();
      });
};
