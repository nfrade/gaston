var path = require('path')
  , fs = require('vigour-fs-promised')
  , originalPath = path.join(__dirname, '../../../config.json');

var config = module.exports = function config(options){
  var socket = this;

  var configPath = options.configPath || originalPath;

  if( !options.key ){
    return fs.readJSONAsync(configPath, 'utf8')
      .then(function(obj){
        socket.emit('config-info', {
          prop: 'Gaston',
          val: obj
        });
      });
  }

  if( !options.val ){
    return fs.readJSONAsync(configPath)
      .then(function(obj){
        var keyArr = options.key.split('.');
        while( obj && (key = keyArr.shift()) ){
          obj = obj[key];
        }

        if(!obj){
          return socket.emit('errored', 'non existing key');
        }

        socket.emit('config-info', {
          prop: options.key,
          val: obj
        });

      });
  }

  var success = false;
  return fs.editJSONAsync(configPath, function(obj){
      var original = obj;
      var keyArr = options.key.split('.');

      for(var i = 0, l = keyArr.length; i < l; i++){
        var key = keyArr[i];
        if(!obj[key]){
          return original;
        }

        if( i === l - 1 ){
          if(typeof obj[key] === 'object'){
            return original;
          }
          obj[key] = options.val;
          success = true;
          return original;
        }
        obj = obj[key];
      }
    }, { space: 2 })
    .then(function(){
      if(success){
        socket.emit('configured', {
          prop: options.key,
          val: options.val
        });
      } else {
        socket.emit('errored', 'setting not configurable');
      }
    });
};