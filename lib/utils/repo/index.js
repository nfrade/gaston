var path = require('path')
  , fs = require('vigour-fs')

module.exports = {
  getBranch: function getBranch(basePath){
  var gitPath = path.join( basePath, '.git', 'HEAD' );
  return fs.existsAsync( gitPath )
    .then(function(exists){
      if(!exists){
        return 'no-branch';
      } else {
        return fs.readFileAsync( gitPath, 'utf8' )
          .then(function(data){
            var branch = data.split('/').pop();
            return branch.replace('\n', '');
          });
      }
    })
}
};