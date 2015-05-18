var openRepo = require('./open-repo');
var branch = require('nodegit').Branch;

module.exports = function(basePath, branchName){
    return openRepo(basePath)
      .then(function(repo){ console.log('branchName', branchName);
        return branch.create(repo, branchName);
      })
      .catch(function(err){
        console.log('hã???', err);
      });
};
