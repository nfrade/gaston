var onChange = module.exports = function onChange(Watcher){
  return function onChange(file){

    if( ~file.indexOf('package.json') ){
      var appName = require(file).name;
      var MiddleWare = require('../../middleware');
      var registry = MiddleWare.registry;
      var registryKeys = Object.keys( registry );
      for(var i = 0, l = registryKeys.length; i < l; i++){
        var key = registryKeys[i];
        if( registry[key].name === appName){
          registry[key] = null;
        }
      }
      // var apps = 
    }

    var io = require('../../../daemon').io;
    io.emit('reload');
  };
};