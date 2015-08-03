var log = require('npmlog')
  , npm = require('npm')
  , fs = require('graceful-fs')
  , path = require('path')
  , gaston = require('../lib/gaston')
  , config = require('../lib/config')
  , Bundler = require('../lib/bundler')
  , npmLoaded;

module.exports = function(){
  gaston.dev()
    .catch( function(err){ log.error('gaston dev', err); } );

    npmLoaded = npm.loadAsync();
};
