var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , browserify = require('browserify')
  , server = require('./server')
  , Bundler = require('./bundler')
  , backtrackFile = require('./utils/backtrack-file')
  , bumpup = require('./utils/bumpup')
  , config = require('./config')
  , logServer = require('./log/server');

var Gaston = module.exports = {

  dev: function(){
    var b = browserify( path.join(__dirname, 'browser', 'gaston.js') );
    b.require( path.join(__dirname, 'browser', 'user-agent.js'), { expose: 'user-agent' } );
    var transform = require( path.join(__dirname, 'bundler', 'compilers', 'gaston-browser-transform') );
    b.transform(transform);
    b.bundle()
      .pipe( fs.createWriteStream( path.join(__dirname, 'browser', 'gaston-compiled.js') ) );
    b.on('error', function(err){
      console.log('error', err);
    })
    return server.start()
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