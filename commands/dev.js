var log = require('npmlog')
  , npm = require('npm')
  , fs = require('graceful-fs')
  , path = require('path')
  , gaston = require('../lib/gaston')
  , Bundler = require('../lib/bundler')
  , npmLoaded
  , config;

module.exports = function(cfg){
  config = cfg;
  gaston.dev()
    .catch( function(err){ log.error('gaston dev', err); } );

    npmLoaded = npm.loadAsync();
};
