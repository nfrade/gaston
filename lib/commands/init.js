var log = require('npmlog')
  , npm = require('npm')
  , fs = require('graceful-fs')
  , path = require('path')
  , prompt = require('prompt')
  , denodeify = require('denodeify')
  , npmLoad = denodeify( npm.load )
  , npmInit = denodeify( npm.init )
  , readFile = denodeify( fs.readFile )
  , writeFile = denodeify( fs.writeFile )
  , readdir = denodeify( fs.readdir )
  , promptGet = denodeify( prompt.get )
  , repo = require('../utils/repo')
  , basePath = process.cwd()
  , filesPath = path.join(__dirname, '../../gaston-files/')
  , pkgPath = path.join(process.cwd(), 'package.json');

module.exports = function(){
  npmLoad()
    .then(function(){ return checkForFile( pkgPath ); })
    .then(function(exists){
      if(!exists){
        return npmInit()
          .then(function(){ 
            pkg = require( pkgPath );
          });
      }
      log.info('gaston', 'there is already a package.json in this directory');
      pkg = require( pkgPath );
    })
    .then( function(){ 
      return checkForFile( path.join( process.cwd(), '.git') )
    })
    .then(function(exists){
      if(!exists){
        log.info('gaston', 'initializing git repo')
        return repo.init( process.cwd() );
      }
      log.info('gaston', 'there is already a git repo in this directory');
    })
    .then( function(){
      return require( path.join(__dirname, '../../gaston-files/gaston.json') ); 
    } )
    .then(function(gaston){
      pkg.gaston = pkg.gaston || gaston;
      return writeFile(pkgPath, JSON.stringify(pkg, null, 4), 'utf8');
    })
    .then(function(){
      log.info('gaston', 'inited successfully; here\'s what package.json looks like:' );
      console.log( JSON.stringify(require(pkgPath), null, 4) );
      log.info('gaston', 'edit the default gaston settings in package.json');
      log.info('gaston', 'run "gaston bootstrap" in a directory you wish to start an application.')
    });
};

function checkForFile(file){
  return new Promise(function(fulfill, reject){
    fs.exists(file, function(exists){
      fulfill(exists);
    });
  });
}
