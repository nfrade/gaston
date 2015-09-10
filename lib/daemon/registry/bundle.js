var bundler = require('../../bundler');

var bundle = module.exports = function bundle(options){
  var socket = this; 
  console.log('bundling', options);
  return bundler.bundle(options)
    .then(function(res){ console.log(Object.keys(res))
      socket.emit('bundled', res);
    })
    .catch(function(err){
      socket.emit('errored', err.stack);
    });
};