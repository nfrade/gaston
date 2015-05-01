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



// module.exports = function getGitHead (dir) {
//   var optimize = false
//   return new Promise(function (resolve, reject) {
//     var p
//     if (gitHead && optimize) {
//       resolve(gitHead)
//     } else {
//       p = path.join(dir, '.git')
//       fs.exists(p, function (exists) {
//         if (exists) {
//           resolve(readFile(path.join(p, 'HEAD'), 'utf8')
//             .then(function (data) {
//               var head = parseHEAD(data)
//               gitHead = head
//               return head
//             }))
//         } else {
//           resolve(getGitHead(path.resolve(dir, '..')))
//         }
//       })
//     }
//   })
// }