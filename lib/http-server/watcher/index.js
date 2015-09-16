var fs = require('vigour-fs-promised')
  , chokidar = require('chokidar')
  , _ = require('lodash')
  , path = require('path')
  , onChangeHandler = require('./handlers/on-change')
  , onUnlinkHandler = require('./handlers/on-unlink');

var Watcher = module.exports = {
  files: [],
  watchers: [],
  map: {},

  addWatcher: function addWatcher(bundler, file){
    var files = Watcher.files;
    if( !~files.indexOf(file) ){
      Watcher.files.push(file);
      var watcher = chokidar.watch(file);
      watcher.on( 'change', onChangeHandler(Watcher) );
      watcher.on( 'unlink', onUnlinkHandler(Watcher) );
      Watcher.watchers.push(watcher);
    }
  },

  removeWatcher: function removeWatcher(watcher){
    var watchers = Watcher.watchers;
    console.log('watchers.length', watchers.length, 'before');
    watchers = watchers.filter(function(item){
      return item !== watcher;
    });
    watcher.close();
    console.log('watchers.length', watchers.length, 'after');
  },

  updateAfterBundle: function updateAfterBundle(bundler){
    var files = bundler.compiled.files;
    // [TODO]check for unRequired files with lodash

    for(var i = 0, l = files.length; i < l; i++){
      var file = files[i];
      if(file === 'index.js'){
        file = bundler.options.source;
      }
      if(file === 'package.json'){
        file = bundler.options.package;
      }

      (function(file){
        fs.existsAsync(file)
          .then(function(exists){
              var ignore = !exists;
              ignore = ignore || ~file.indexOf('/gaston/lib/');
              ignore = ignore || ~file.indexOf('/gaston/node_modules/');
              if(!ignore){
                Watcher.addWatcher(bundler, file);
              }
          });
      })(file);
    }

  }
};