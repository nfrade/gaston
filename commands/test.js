var log = require('npmlog')
  , npm = require('npm')
  , fs = require('graceful-fs')
  , path = require('path')
  , gaston = require('../lib/gaston')
  , Bundler = require('../lib/bundler')
  , stdin = process.openStdin()
  , npmLoaded
  , config;

module.exports = function(cfg){
  config = cfg;
  gaston.test()
    .catch( function(err){ log.error('gaston test', err); } );

    npmLoaded = npm.loadAsync();
};

var helpPromise = fs.readFileAsync( path.join(__dirname, '../help', 'in-dev.txt'), 'utf8' );
