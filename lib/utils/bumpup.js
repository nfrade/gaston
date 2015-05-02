var log = require('npmlog')
  , fs = require('fs')
  , path = require('path')
  , Promise = require('promise')
  , nodegit = require('nodegit')
  , denodeify = require('denodeify')
  , readFile = denodeify( require('graceful-fs').readFile )
  , writeFile = denodeify( require('graceful-fs').writeFile )
  , backtrackFile = require('./backtrack-file')
  , repo = require('./repo')
  , rEx = /\"version\"\: \"(\d+\.\d+\.\d+)\"/
  , bumps = ['major', 'minor', 'revision'];

module.exports = function(pkgPath, bump){
  
  pkgPath = pkgPath || path.join(process.cwd(), 'package.json');
  bump = bump || 'revision';
  if( bumps.indexOf(bump) === -1 ){
    reject(new Error('Incorrect bump type - use major, minor or revision'));
  };
  var pkgData, bumpedVersion;
  return readFile(pkgPath, 'utf8')
    .then(function(data){
        pkgData = data;
        var match = pkgData.match(rEx);
        return match[1];
      })
      .then( getCommitedVersion )
      .then(function(versions){ 
        if(versions.commited !== versions.current){
          log.info('bumpup', 'version will be bumped after commit, currently', versions.commited);
          return;
        }
        bumpedVersion = bumpVersion(versions.current, bump);
        var newData = pkgData.replace(rEx, '"version": "' + bumpedVersion + '"');
        return writeFile(pkgPath, newData);
      })
      .then(function(){
        if(bumpedVersion){
          log.info('bumpup', 'bumped up version to ', bumpedVersion);
        }
        return bumpedVersion;
      })
      .catch(function(err){
        log.error('bumpup', err);
      });
};

var bumpVersion = function(currentVersion, bump){
  currentVersion = currentVersion.split('.'); 
      switch(bump){
        case 'revision':
          currentVersion[2] = parseInt(currentVersion[2], 10) + 1;
          break;
        case 'minor':
          currentVersion[1] = parseInt(currentVersion[1], 10) + 1;
          currentVersion[2] = 0;
          break;
        case 'major':
          currentVersion[0] = parseInt(currentVersion[0], 10) + 1;
          currentVersion[1] = 0;
          currentVersion[2] = 0;
          break;
      }
      
      return currentVersion.join('.');
}

var getCommitedVersion = function(initialVersion){
  return repo.getFileAtCommit('package.json', 'HEAD')
    .then(function(pkg){
      var match = pkg.match(rEx);
      var commitedVersion = match[1];
      return({
        current: initialVersion,
        commited: commitedVersion
      });
    })
    .catch(function(err){
      log.error(err);
    });
};

