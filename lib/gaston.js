var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')
  , chokidar = require('chokidar')
  , server = require('./server')
  , Bundler = require('./bundler')
  , browserify = require('browserify')
  , backtrackFile = require('./utils/backtrack-file')
  , bumpup = require('./utils/bumpup')
  , config = require('./config')
  , logServer = require('./log/server')
  , socketServer = require('./server/socket-server')
  // , Tracker = require('gaston-time-tracker');

var Gaston = module.exports = {

  dev: function(isTesting){
    compileGaston();
    return socketServer.start()
      .then( function(){
        return server.start({
          isTesting: isTesting
        })
      })
      .then(function(){
        // Tracker.init(config);
      })
      .then(function(){
        require('./stdinListener')
      });
  },

  test: function(){
    return Gaston.dev(true);
  },

  build: function(buildPath){
    var newVersion;
    Bundler.setup({
      path: buildPath || process.cwd(),
      isBuilding: true
    });
    var pkgPath = backtrackFile('package.json');
    return bumpup(pkgPath, config.bump || 'revision')
      .then(function(version){
        return newVersion = version;
      })
      .then( Bundler.compile )
      .then(function(){
        return newVersion;
      })
  },
  
  bundle: function(){
    Bundler.setup({
      path: process.cwd(),
      isBuilding: true,
      noMinimize: true
    });
    Bundler.isBuilding = true;
    Bundler.noMinimize = true;
    
    Bundler.compile();

    var watcher = chokidar.watch( path.join(process.cwd()) );
    watcher.on('change',  function(file){ 
      if( !~file.indexOf('bundle') && !~file.indexOf('build') ){
        Bundler.compile();
      }
    });
  },

  launch: function(){
    server.launch();
  }
};

var compileGaston = function(){
  var br = browserify( path.join(__dirname, 'browser', 'gaston.js') );
  br.require( path.join(__dirname, 'browser', 'dummy.js'), {expose: 'index.js'} );
  br.require( path.join(config.basePath, 'package.json'), { expose: 'package.json'} );
  br.transform( require( path.join(__dirname, 'bundler', 'compilers', 'gaston-browser-transform.js') ) );
  br.transform( require('blessify') )
  var b = br.bundle()
  b.pipe( fs.createWriteStream( path.join(__dirname, 'browser', 'gaston-compiled.js') ) );
}