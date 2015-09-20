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

  addWatcher: function addWatcher(file, bundler){
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
    watchers = watchers.filter(function(item){
      return item !== watcher;
    });
    watcher.close();
  },

  updateAfterBundle: function updateAfterBundle(bundler){
    var files = bundler.compiled.files;

    for(var i = 0, l = files.length; i < l; i++){
      var file = files[i];
      if(file === 'index.js'){
        file = bundler.options.source;
      }
      if(file === 'package.json'){
        file = bundler.options.package;
      }
      if(!file){
        return;
      }
      (function(file){
        fs.existsAsync(file)
          .then(function(exists){
              var ignore = !exists;
              ignore = ignore || ~file.indexOf('/gaston/lib/');
              ignore = ignore || ~file.indexOf('/gaston/node_modules/');
              if(!ignore){
                Watcher.addWatcher(file, bundler);
              }
          });
      })(file);
    }

  }
};