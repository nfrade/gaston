var log = require('npmlog')
  , Bundler = require('../../../bundler');

module.exports = function(socket){
  var gaston = require('../../../')

  socket.on('build', function(options){
    gaston.builder.run(options)
      .then(function(version){
        Bundler.building = false;
        socket.emit('build-complete', { version: version });
      })
      .catch(function(err){
        log.info('build', err);
      });
  });

}; 