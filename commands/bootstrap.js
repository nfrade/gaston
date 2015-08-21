var log = require('npmlog')
  , Promise = require('bluebird')
  , fs = require('graceful-fs')
  , path = require('path')
  , ncp = Promise.promisify( require('ncp').ncp )
  , path = require('path')
  , mkdirp = Promise.promisify( require('mkdirp') )
  , filesPath = path.join(__dirname, '../gaston-files/bootstrap')
  , config

module.exports = function(cfg){
  config = cfg;
  return createAppFiles()
    .then(function(){
      log.info('gaston', 'application bootstrapped successfully');
    })
    .catch(function(err){
      log.error('gaston', err);
    });
};

var createAppFiles = function(){
  var cssExt;
  switch(config.cssCompiler){
    case 'sass':
      cssExt = '.scss';
      break;
    default:
      cssExt = '.less';
      break;
  }
  
  var pathCSS = path.join(process.cwd(), 'global' + cssExt);
  var pathJS = path.join(process.cwd(), 'index.js');
  var existsCSS, existsJS;

  return fs.existsAsync(pathCSS)
    .then( function(exists){
      if(!exists){
        fs.createReadStream( path.join(filesPath, 'global.css') )
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
            content = content.replace( '{{jspath}}', 'bundle.js' );
            content = content.replace( '{{csspath}}', 'bundle.css' );
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