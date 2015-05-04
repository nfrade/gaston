var log = require('npmlog');

var options = {
  path: process.cwd(),
  building: true,
  bump: 'revision'
}

module.exports = {
  run: function(opt){
    opt = opt || {};
    options.path = opt.path || options.path;
    options.bump = opt.bump || options.bump;
    var gaston = require('./index');
    return gaston.build(options);
  }
};