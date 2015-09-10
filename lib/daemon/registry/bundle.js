var bundler = require('../../bundler');

var start = module.exports = function start(options){
  var socket = this; 
  console.log('bundling', options);
  return bundler.bundle(options)
    .then(function(res){
      socket.emit('bundled', res);
    })
    .catch(function(err){
      socket.emit('errored', err.message);
    });
};