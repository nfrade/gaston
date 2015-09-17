var Bundler = require('../../bundler');

var bundle = module.exports = function bundle(options){
  var socket = this; 
  var bundler = new Bundler(options);
  return bundler.bundle(options)
    .then(function(bundle){
      socket.emit('bundled', bundle);
    })
    .catch(function(err){ 
      socket.emit( 'errored', err.message || err );
    });
};