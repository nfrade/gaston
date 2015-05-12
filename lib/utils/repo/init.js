var nodegit = require('nodegit');

module.exports = function(basePath, isBare){
  console.log('in repo/init', basePath)
  return nodegit.Repository.init(basePath, isBare || 0)
    .catch(function(err){
      log.err('gaston', err);
    });
}