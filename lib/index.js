
var server = require('./server');

var Gaston = module.exports = {
  start: function(){
    server.start.apply(server, arguments);
  }
};