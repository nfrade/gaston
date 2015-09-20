var fs = require('vigour-fs-promised')
  , path = require('path')
  , _ = require('lodash')
  , url = require('url')
  , mime = require('mime')
  , through = require('through2')
  , Bundler = require('../../bundler')
  , Watcher = require('../watcher')
  , errorHandler = require('./error-handler')
  , backtrackFile = require('../../utils/backtrack-file')
  , replacer = require('./utils/replacer')
  , gastonFilesPath = path.join(__dirname, '../../..', 'gaston-files')
  , indexPagePath = path.join(gastonFilesPath, 'index.html')
  , testPagePath = path.join(gastonFilesPath, 'test.html');

var registry = {};

var Middleware = module.exports = function(options){
  Middleware.options = options;
  Middleware.registry = registry;
  var hashRegex = new RegExp(path.sep, 'g');
  var basePath = options['base-path'];

  return function(req, res, next){
    var parsedUrl = url.parse(req.url, true);
    var pathname = parsedUrl.pathname;
    var packagePath = backtrackFile( 'package.json', appPath );
    var pkg = packagePath? require(packagePath) : {};
    var appPath = path.join( basePath, pathname );
    var hash = appPath.replace( hashRegex, '_' );
    var query = parsedUrl.query;
    var action = query.action;
    var requestedFile = pathname.split('/').pop();

    if( requestedFile === 'bundle.css' || requestedFile === 'bundle.js' ){
      var ext = path.extname(requestedFile).replace('.', '');
      hash = hash.replace( requestedFile, '' );
      var app = registry[hash];
      res.set( {'Content-Type': mime.lookup(requestedFile) } )
      return res.status(200).send(app.bundler.compiled[ext]);
    }

    if(!action){
      return next();
    }

    var fileToCompile = path.join( appPath, query.file );
    var appPath = path.dirname(fileToCompile);
    var packagePath = backtrackFile('package.json', appPath);

    var app = registry[hash];
    if(!app){
      var bundlerOptions = {
        source: fileToCompile,
        gaston: true,
        testing: action === 'test',
        package: packagePath,
        'source-maps': options['source-maps']
      };

      app = registry[hash] = {};
      app.hash = hash;
      app.packagePath = packagePath;
      if(app.packagePath){
        app.name = require(packagePath).name;
      }
      var config = Config.get(app.name);
      bundlerOptions = _.extend(bundlerOptions, config);
      var bundler = app.bundler = new Bundler( bundlerOptions );
    }

    var titlePath = fileToCompile.substr(fileToCompile.length - 15);
    var title = titlePath + ' - ' + pkg.name;
    app.bundler.bundle()
      .then(function(bundle){
        app.bundler.compiled = bundle;
        app.bundler.lastCompiled = new Date();
        Watcher.updateAfterBundle(app.bundler);
        var pagePath = query.action === 'test'? testPagePath : indexPagePath;
        fs.createReadStream( pagePath )
          .pipe( replacer( { title: title } ) )
          .pipe( res );
      })
      .catch( errorHandler(res, title) );
  };

};

// [TODO] use this in the future
var getAppIndex = function getAppIndex(options, dirPath){
  return function(){
    var indexPath,
      exists;

    indexPath = path.join( dirPath, 'index.html');
    exists = fs.existsSync(indexPath);

    if(!exists){
      indexPath = path.join( options.basePath, 'index.html');
      if( !fs.existsSync(indexPath) ){
        indexPath = path.join(gastonFilesPath, 'bootstrap', 'index.html');
      }
    }

    return fs.createReadStream(indexPath);
  }
};


