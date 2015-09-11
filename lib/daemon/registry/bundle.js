var bundler = require('../../bundler')
  _ = require('lodash');

var bundle = module.exports = function bundle(options){
  var socket = this; 
  return bundler.bundle(options)
    .then(function(res){ console.log(Object.keys(res))
      socket.emit('bundled', res);
    })
    .catch(function(err){ 
      socket.emit( 'errored', err.message );
    });
};