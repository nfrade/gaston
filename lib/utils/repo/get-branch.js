var openRepo = require('./open-repo');

module.exports = function(basePath){
    return openRepo(basePath)
      .then(function(repo){
        return repo.getCurrentBranch()
      })
      .then(function(branch){
        return branch.name().split('/').pop();
      });
};
