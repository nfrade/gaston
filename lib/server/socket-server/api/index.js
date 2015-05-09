var log = require('npmlog')
  , Bundler = require('../../../bundler');

module.exports = function(socket){
  var gaston = require('../../../')

  socket.on('build', function(options){
    gaston.builder.run(options)
      .then(function(){
        Bundler.building = false;
      })
      .catch(function(err){
        log.info('build', err);
      });
  });

}; 