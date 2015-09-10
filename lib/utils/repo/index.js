var path = require('path')
  , fs = require('vigour-fs-promised')

module.exports = {
  getBranch: function getBranch(basePath){
    var gitPath = path.join( basePath, '.git', 'HEAD' );
    if( !fs.existsSync(gitPath) ){
      return 'no-branch';
    } else {
      var branch = fs.readFileSync(gitPath, 'utf8')
        .split('/')
        .pop()
        .replace('\n', '');
      return branch;
    }
  }
};