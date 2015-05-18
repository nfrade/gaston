var log = require('npmlog')
  , Bundler = require('../../../bundler');

module.exports = function(socket){
  gaston = gaston || require('../../../gaston');

  socket.on('build', function(){
    gaston.build()
      .then(function(version){
        Bundler.building = false;
        socket.emit('build-complete', { version: version });
      })
      .catch(function(err){
        log.info('build', err);
      });
  });

}; 