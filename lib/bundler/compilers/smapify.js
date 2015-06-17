var through = require('through2')
  , Bundler = require('../');

var files = {};

module.exports = function(file){
  return through(function(buf, enc, next){
    var self = this;
    var lines = buf.toString('utf8').split('\n');

    var prettyFile = file.replace(Bundler.dirPath, '')

    files[prettyFile] = lines.length;

    self.push(buf);
    next();
  });
};

module.exports.files = files;