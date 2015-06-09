var through = require('through2')
  , path = require('path')
  , Bundler = require('../')
  , socketServer = require('../../server/socket-server')
  , ip = require('ip');


module.exports = function(file){
  return through(function(buf, enc, next){
    var self = this;

    if( file.indexOf('lib/browser/gaston.js') === -1 ){
      self.push(buf);
      return next();
    }

    var str = buf.toString('utf8');
    str = str.replace('{{socketServer.ip}}', ip.address());
    str = str.replace('{{socketServer.port}}', socketServer.port);
    self.push(str);
    next();

  });
};

