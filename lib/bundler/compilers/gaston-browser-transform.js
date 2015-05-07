var through = require('through2')
  , socketServer = require('../../server/socket-server')
  , localIpPromise;


module.exports = function(file){
  return through(function(buf, enc, next){
    var self = this;
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

//resolve server IP
(function(){
  localIpPromise = new Promise(function(fulfill, reject){
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
      fulfill(add);
    });
  });
})();