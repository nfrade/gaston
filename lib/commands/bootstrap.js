var log = require('npmlog')
  , Promise = require('bluebird')
  , fs = require('graceful-fs')
  , path = require('path')
  , ncp = Promise.promisify( require('ncp').ncp )
  , path = require('path')
  , mkdirp = Promise.promisify( require('mkdirp') )
  , config = require('../config')
  , filesPath = path.join(__dirname, '../../gaston-files/bootstrap');

module.exports = function(){
  return createDirectories()
    .then( createAppFiles )
    .then(function(){
      log.info('gaston', 'application bootstrapped successfully');
    })
    .catch(function(err){
      log.error('gaston', err);
    });
};

var createDirectories = function(){
  var bundlePath = path.join(process.cwd(), config.bundle);
  return mkdirp( bundlePath )
    .then( function(){ return mkdirp( path.join(process.cwd(), config.build) );} );
}

var createAppFiles = function(){
  var cssExt;
  switch(config.cssCompiler){
    case 'less':
      cssExt = '.less';
      break;
    case 'sass':
      cssExt = '.scss';
      break;
  }
  
  var pathCSS = path.join(process.cwd(), 'styles' + cssExt);
  var pathJS = path.join(process.cwd(), 'index.js');
  var existsCSS, existsJS;

  return fs.existsAsync(pathCSS)
    .then( function(exists){
      if(!exists){
        fs.createReadStream( path.join(filesPath, 'styles.css') )
          .pipe( fs.createWriteStream(pathCSS) );
      }
    } )
    .then( function(){ return fs.existsAsync(pathJS); })
    .then( function(exists){
      if(!exists){
        fs.createReadStream( path.join(filesPath, 'index.js') )
          .pipe( fs.createWriteStream(pathJS) );
      }
    } )
    .then( function(){
      var indexHTML;
      return fs.readFileAsync( path.join(filesPath, 'index.html'), 'utf8' )
        .then( function(data){ indexHTML = data; } )
        .then( function(){ return fs.existsSync(path.join( process.cwd(), 'index.html') ); } )
        .then( function(exists){
          if(!exists){ 
            var content = indexHTML.replace('{{title}}', config.pkg.name);
            content = content.replace( '{{jspath}}', path.join(config.bundle, 'bundle.js') );
            content = content.replace( '{{csspath}}', path.join(config.bundle, 'bundle.css') );
            return fs.writeFileAsync( path.join(process.cwd(), 'index.html'), content, 'utf8')
          }
        });
    } )
    .catch(function(err){
      log.error('gaston', err);
    });
};

var getMochaPath = module.exports.getMochaPath = function(){
  var mochaPath = '';
  var p = process.cwd().replace(config.basePath, '');
  var deepness = p.split('/').length;
  for(var i = 0; i < deepness; i++){
    mochaPath += '../';
  }
  return mochaPath + 'node_modules/mocha';
}