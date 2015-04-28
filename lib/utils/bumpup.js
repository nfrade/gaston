var fs = require('fs')
  , path = require('path')
  , Promise = require('promise')
  , rEx = /\"version\"\: \"(\d+\.\d+\.\d+)\"/
  , bumps = ['major', 'minor', 'revision'];

module.exports = function(pkgPath, bump){
  return new Promise(function(fulfill, reject){
    pkgPath = pkgPath || path.join(process.cwd(), 'package.json');
    bump = bump || 'revision';
    if( bumps.indexOf(bump) === -1 ){
      reject(new Error('Incorrect bump type - use major, minor or revision'));
    };
    fs.readFile(pkgPath, 'utf8', function(err, data){
      if(err){
        return reject(err);
      }

      var match = data.match(rEx);

      var currVersion = match[1].split('.');
      switch(bump){
        case 'revision':
          currVersion[2] = parseInt(currVersion[2], 10) + 1;
          break;
        case 'minor':
          currVersion[1] = parseInt(currVersion[1], 10) + 1;
          currVersion[2] = 0;
          break;
        case 'major':
          currVersion[0] = parseInt(currVersion[0], 10) + 1;
          currVersion[1] = 0;
          currVersion[2] = 0;
          break;
      }
      
      var newVersion = currVersion.join('.');
      data = data.replace(rEx, '"version": "' + newVersion + '"');
      fs.writeFile(pkgPath, data, 'utf8', function(){
        if(err){
          return reject(err);
        }
        fulfill(newVersion);
      });
    });
  })
};