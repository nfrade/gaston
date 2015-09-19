var fs = require('vigour-fs-promised')
  , path = require('path')
  , configPath = path.join(__dirname, '../../config');

var Config = module.exports = {
  gaston: undefined,
  init: function(){
    return fs.readdirAsync(configPath)
      .then(function(files){
        console.log(files);
      });

    // return parseConfig('gaston')
    //   .then(function(){
    //     Config.gaston = obj;
    //   })
  }
};


var parseConfig = function(names){
  names = Array.isArray(names)? names : [names];
};