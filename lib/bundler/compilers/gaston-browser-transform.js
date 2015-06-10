var through = require('through2')
  , path = require('path')
  , Bundler = require('../')
  , Server = require('../../server')
  , SocketServer = require('../../server/socket-server')
  , ip = require('ip');


module.exports = function(file){
  return through(function(buf, enc, next){
    var self = this;

    if( file.indexOf('lib/browser/gaston.js') === -1 ){
      self.push(buf);
      return next();
    }
console.log('port', Server.port);
    var str = buf.toString('utf8');
    str = str.replace('{{gaston.ip}}', ip.address());
    str = str.replace('{{gaston.port}}', Server.port);
    str = str.replace('{{gaston.socket}}', SocketServer.port);
    self.push(str);
    next();

  });
};

