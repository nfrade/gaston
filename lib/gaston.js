var log = require('npmlog')
  , Promise = require('bluebird')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , chokidar = require('chokidar')
  , server = require('./server')
  , Bundler = require('./bundler')
  , browserify = require('browserify')
  , backtrackFile = require('./utils/backtrack-file')
  // , bumpup = require('./utils/bumpup')
  , logServer = require('./log/server')
  , socketServer = require('./server/socket-server')
  , mkdirp = Promise.promisify( require('mkdirp') )
  // , Tracker = require('gaston-time-tracker');

var Gaston = module.exports = {

  performance: require('./performance'),

  dev: function(config){
    log.info('gaston', 'starting gaston');
    return socketServer.start(config)
      .then(function(){
        return server.start(config)
      })
      .then(function(){
        return compileGaston(config);
      })
      .then(function(){
        require('./stdinListener')(config);
        log.info('server', 'server is listening on port ', config.port);
        log.info('server', 'server address is', server.serverIP );
        log.info('gaston', 'gaston is listening on port ', socketServer.port);
        log.info('press \'h\' for help or \'l\' to launch a browser');
      })
      .catch(function(err){
        console.log(err.stack);
      });
  },

  build: function(config, fileToCompile, destination, isBase ){
    var newVersion;
    var pkgPath = backtrackFile('package.json');

    return mkdirp(destination)
      // .then(function(){
      //   if( isBase ){
      //     return bumpup(pkgPath, config.bump || 'revision');
      //   }
      // })
      .then(function(){
        return Bundler.build( fileToCompile, destination, isBase )
      })
      .then(function(){
        log.info('bundler', 'build successful')
      });
  },

  launch: function(config){
    server.launch(config);
  }
};

var compileGaston = function(config){
  return new Promise(function(fulfill, reject){
    var br = browserify( path.join(__dirname, 'browser', 'gaston.js') );
    br.require( path.join(__dirname, 'browser', 'dummy.js'), {expose: 'index.js'} );
    br.require( path.join(config.basePath, 'package.json'), { expose: 'package.json'} );
    br.transform( require( path.join(__dirname, 'bundler', 'gaston-browser-transform.js') ) );
    br.require( path.join(__dirname, 'browser', 'tester.js'), {
      expose: 'gaston-tester'
    });
    var b = br.bundle();

    b.on('error', function(err){
      reject(err);
    });

    var wStream = fs.createWriteStream( path.join(__dirname, 'browser', 'gaston-compiled.js') );
    b.pipe( wStream );

    wStream.on('close', function(){
      fulfill();
    })
  });
}