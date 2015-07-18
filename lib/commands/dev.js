var log = require('npmlog')
  , npm = require('npm')
  , fs = require('graceful-fs')
  , path = require('path')
  , gaston = require('../gaston')
  , config = require('../config')
  , Bundler = require('../bundler')
  , npmLoaded;

module.exports = function(){
  gaston.dev()
    .catch( function(err){ log.error('gaston dev', err); } );

    npmLoaded = npm.loadAsync();
};
