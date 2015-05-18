var log = require('npmlog')
  , Bundler = require('../../../bundler')
  , gaston;

module.exports = function(socket){
  gaston = gaston || require('../../../gaston');

  socket.on('build', function(){ console.log('here build')
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