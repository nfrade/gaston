var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , server = require('./server')
  , Bundler = require('./bundler')
  , browserify = require('browserify')
  , backtrackFile = require('./utils/backtrack-file')
  , bumpup = require('./utils/bumpup')
  , config = require('./config')
  , logServer = require('./log/server')
  , socketServer = require('./server/socket-server');

var Gaston = module.exports = {

  dev: function(){
    compileGaston();
    return socketServer.start()
      .then( server.start );
  },

  build: function(buildPath){
    var newVersion;
    Bundler.setup({
      path: buildPath || process.cwd()
    });
    config.isBuilding = true;
    var pkgPath = backtrackFile('package.json');
    return bumpup(pkgPath, config.bump || 'revision')
      .then(function(version){
        return newVersion = version;
      })
      .then( Bundler.compile )
      .then(function(){
        Bundler.isBuilding = false;
        return newVersion;
      })
  },

  launch: function(){
    server.launch();
  }
};

var compileGaston = function(){
  var br = browserify( path.join(__dirname, 'browser', 'gaston.js') );
  br.require( path.join(__dirname, 'browser', 'dummy.js'), {expose: 'gaston-application'} );
  br.transform( require( path.join(__dirname, 'bundler', 'compilers', 'gaston-browser-transform.js') ) );
  var b = br.bundle()
  b.pipe( fs.createWriteStream( path.join(__dirname, 'browser', 'gaston-compiled.js') ) );
}