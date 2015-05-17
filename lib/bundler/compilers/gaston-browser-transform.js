var through = require('through2')
  , path = require('path')
  , Bundler = require('../')
  , socketServer = require('../../server/socket-server')
  , localIpPromise = require('../../utils/get-local-ip');


module.exports = function(file){
  return through(function(buf, enc, next){
    var self = this;

    if( file === path.join(Bundler.dirPath, 'index.js') ){
      var str = buf.toString('utf8');
      str = 'require(\'gaston\');\n' + str;
      self.push(str);
      return next();
    }

    if( file.indexOf('lib/browser/gaston.js') === -1 ){
      self.push(buf);
      return next();
    }

    localIpPromise
      .then(function(localIP){
        var str = buf.toString('utf8');
        str = str.replace('{{socketServer.ip}}', localIP);
        str = str.replace('{{socketServer.port}}', socketServer.port);
        self.push(str);
        next();
      });
  });
};

