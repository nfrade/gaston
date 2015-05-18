var log = require('npmlog')
  , Promise = require('promise')
  , fs = require('fs')
  , path = require('path')
  , denodeify = require('denodeify')
  , readFile = denodeify( fs.readFile )
  , writeFile = denodeify( fs.writeFile )
  , mkdirp = denodeify( require('mkdirp') )
  , config = require('../config')
  , filesPath = path.join(__dirname, '../../gaston-files/bootstrap');

module.exports = function(){
  createDirectories()
    .then( createIndexFiles )
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
  return new Promise(function(fulfill, reject){
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
    var existsCSS = fs.existsSync(pathCSS);
    var existsJS = fs.existsSync(pathJS);

    var handlerTotal = handlerCount = 0;

    var streamCloseHandler = function(){
      if(++handlerCount === handlerTotal){
        log.info('application files created successfully');
        fulfill();
      }
    };

    if(existsJS){
      log.info('gaston', 'index.js already exists.');
    } else {
      handlerTotal++;
      var wStreamJS = fs.createWriteStream(pathJS);
      wStreamJS.on('close', streamCloseHandler);
      fs.createReadStream( path.join(filesPath, 'index.js') )
        .pipe(wStreamJS);
    }
    if(existsCSS){
      log.info('gaston', 'style' + cssExt + ' already exists.');
    } else {
      handlerTotal++;
      var wStreamCSS = fs.createWriteStream(pathCSS);
      wStreamJS.on('close', streamCloseHandler);
      fs.createReadStream( path.join(filesPath, 'styles.css') )
        .pipe(wStreamCSS);
    }

    if(handlerTotal === 0){
      fulfill();
    }
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
