var path = require('path')
  , fs = require('vigour-fs-promised')
  , configPath = path.join(__dirname, '../../../config.json');

var config = module.exports = function config(options){
  var socket = this;

  if( !options.key ){
    return fs.readFileAsync(configPath, 'utf8')
      .then(function(data){
        return "Global Settings:\n" + data;
      })
      .done(function(message){
        socket.emit('configured', message);
      });
  }

  if( !options.val ){
    return fs.readJSONAsync(configPath)
      .then(function(obj){
        var keyArr = options.key.split('.');
        console.log(keyArr)
        while( obj && (key = keyArr.shift()) ){
          obj = obj[key];
        }

        return options.key + ': ' + ( JSON.stringify(obj) || 'not set');
      })
      .done(function(message){
        socket.emit('configured', message);
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
        socket.emit('configured', 'setting changed');
        return ;
      } else {
        socket.emit('errored', 'setting not configurable');
      }
    });
};