var bundler = require('../../bundler')
  _ = require('lodash');

var bundle = module.exports = function bundle(options){
  var socket = this; 
  return bundler.bundle(options)
    .then(function(bundle){
      socket.emit('bundled', bundle);
    })
    .catch(function(err){ 
      socket.emit( 'errored', err.message || err );
    });
};