var fs = require('graceful-fs')
  , path = require('path')
  , backtrackFile = require('./backtrack-file')
  , Promise = require('promise');

module.exports = function getGitHead(basePath){
  return new Promise(function(fulfill, reject){
    var gitHeadPath = backtrackFile( '.git/HEAD', basePath || process.cwd() );
    fs.readFile(gitHeadPath, 'utf8', function(err, data){
      if(err){
        reject(err);
      }
      var gitHead = data.split('/').pop().replace('\n', '');
      fulfill(gitHead);
    });
  });
  

  return gitHeadPath;
};
