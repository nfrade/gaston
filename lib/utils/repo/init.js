var nodegit = require('nodegit');

module.exports = function(basePath, isBare){
  return nodegit.Repository.init(basePath, isBare || 0)
    .catch(function(err){
      log.err('gaston', err);
    });
}