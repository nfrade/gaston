var log = require('npmlog')
  , Promise = require('bluebird')
  , npm = require('npm')
  , fs = require('vigour-fs-promised')
  , mkdirp = Promise.promisify( require('mkdirp') )
  , path = require('path')
  // , repo = require('../lib/utils/repo')
  , basePath = process.cwd()
  , filesPath = path.join(__dirname, '../gaston-files/')
  , pkgPath = path.join(basePath, 'package.json')
  // , gitPath = path.join(basePath + '.git')
  , gitignorePath = path.join(basePath, '.gitignore')
  , config
  , pkg;
  
module.exports = function(cfg){
  config = cfg;
  return npm.loadAsync()
    .then( function(){ return fs.existsAsync(pkgPath); } )
    .then( function(exists){ return !exists && npm.initAsync(); })
    .then( function(){ pkg = require(pkgPath); } )
    // .then( function(){ return fs.existsAsync( gitPath ) } )
    // .then( function(exists){ return !exists && repo.init( basePath ); } )
    .then( function(){ return require( path.join(filesPath, 'gaston.json') ); } )
    .then( function(gaston){ pkg.gaston = pkg.gaston || gaston; } )
    .then( function(){ return fs.writeFileAsync(pkgPath, JSON.stringify(pkg, null, 4), 'utf8'); } )
    .then( function(){ console.log('exists?'); return fs.existsAsync( gitignorePath ); } )
    .then( function(){ return mkdirp( path.join(basePath, 'src') ); } )
    .then( function(){ return mkdirp( path.join(basePath, 'test') ); } )
    .then( function(exists){
      if(!exists){
        fs.createReadStream( path.join(filesPath, '.gitignore') )
          .pipe( fs.createWriteStream( gitignorePath ) );
      }
    } )
    .then( function(){ 
      log.info('gaston', 'inited successfully; here\'s what package.json[gaston] looks like:' );
      console.log( pkg.gaston );
      log.info('gaston', 'edit the default gaston settings in package.json');
      log.info('gaston', 'run "gaston bootstrap" in a directory you wish to start an application.')
    } );

};

