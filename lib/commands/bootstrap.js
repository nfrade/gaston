var log = require('npmlog')
  , Promise = require('bluebird')
  , fs = require('graceful-fs')
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
  return mkdirp( path.join(process.cwd(), config.bundle) )
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
        })
        .then( function(){ return fs.existsSync(path.join( process.cwd(), 'build.html') ); })
        .then( function(exists){
          if(!exists){
            var content = indexHTML.replace('{{title}}', config.pkg.name);
            content = content.replace( '{{jspath}}', path.join(config.bundle, 'build.js') );
            content = content.replace( '{{csspath}}', path.join(config.bundle, 'build.css') );
            return fs.writeFileAsync( path.join(process.cwd(), 'build.html'), content, 'utf8')
          }
        });
    } )
    .catch(function(err){
      log.error('gaston', err);
    });
};

var createIndexFiles = function(){
  var indexPath = path.join(filesPath, 'index.html')
  var pathDev = path.join(process.cwd(), 'index.html');
  var pathBuild = path.join(process.cwd(), 'build.html');
  var existsDev = fs.existsSync(pathDev);
  var existsBuild = fs.existsSync(pathBuild);
  return readFile(indexPath, 'utf8')
    .then(function(data){
      var indexDev = data.replace('{{title}}', config.pkg.name);
      indexDev = indexDev.replace( '{{jspath}}', path.join(config.bundle, 'bundle.js') );
      indexDev = indexDev.replace( '{{csspath}}', path.join(config.bundle, 'bundle.css') )

      var indexBuild = data.replace('{{title}}', config.pkg.name);
      indexBuild = indexBuild.replace( '{{jspath}}', path.join(config.build, 'build.js') );
      indexBuild = indexBuild.replace( '{{csspath}}', path.join(config.build, 'build.css') )

      var promise, promises = [];
      if(existsDev){
        log.info('gaston', 'index.html already exists. Please make the necessary adjustments for the js and css paths');
      }  else {
        promise = writeFile( pathDev, indexDev, 'utf8' )
          .then(function(){ log.info('gaston', 'index.html created successfully'); })
        promises.push( promise );
      }
      if(existsBuild){
        log.info('gaston', 'build.html already exists. Please make the necessary adjustments for the js and css paths');
      } else {
        promise = writeFile( pathBuild, indexBuild, 'utf8' )
          .then(function(){ log.info('gaston', 'build.html created successfully'); })
        promises.push( promise );
      }

      return Promise.all(promises);
    });
};
