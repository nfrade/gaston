var log = require('npmlog')
  , fs = require('vigour-fs')
  , path = require('path')
  , gaston = require('../lib/gaston')
  , Bundler = require('../lib/bundler')
  // , npmLoaded
  , config;

module.exports = function(cfg){
  config = cfg;
  gaston.dev(config)
    .catch( function(err){ log.error('gaston dev', err); } );

    // npmLoaded = npm.loadAsync();
};
