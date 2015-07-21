var log = require('npmlog')
  , npm = require('npm')
  , fs = require('graceful-fs')
  , path = require('path')
  , gaston = require('../gaston')
  , config = require('../config')
  , Bundler = require('../bundler')
  , stdin = process.openStdin()
  , npmLoaded;

module.exports = function(){
  gaston.test()
    .catch( function(err){ log.error('gaston test', err); } );

    npmLoaded = npm.loadAsync();
};

var helpPromise = fs.readFileAsync( path.join(__dirname, '../../help', 'in-dev.txt'), 'utf8' );
