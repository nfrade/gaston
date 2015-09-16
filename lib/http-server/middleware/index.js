var fs = require('vigour-fs-promised')
  , path = require('path')
  , url = require('url')
  , mime = require('mime')
  , through = require('through2')
  , Bundler = require('../../bundler')
  , errorHandler = require('./error-handler')
  , backtrackFile = require('../../utils/backtrack-file')
  , replacer = require('./utils/replacer')
  // , Watcher = require('../../bundler/watcher')
  , gastonFilesPath = path.join(__dirname, '../../..', 'gaston-files')
  , indexPagePath = path.join(gastonFilesPath, 'index.html')
  , testPagePath = path.join(gastonFilesPath, 'test.html');

var bundlers = {};

var Middleware = module.exports = function(options){
  Middleware.options = options;
  Middleware.bundlers = bundlers;
  var hashRegex = new RegExp(path.sep, 'g');
  var basePath = options['base-path'];

  return function(req, res, next){
    var parsedUrl = url.parse(req.url, true);
    var pathname = parsedUrl.pathname;
    var packagePath = backtrackFile( 'package.json', appPath );
    var pkg = require(packagePath);
    var appPath = path.join( basePath, pathname );
    var hash = appPath.replace( hashRegex, '_' );
    var query = parsedUrl.query;
    var action = query.action;
    var requestedFile = pathname.split('/').pop();

    if( requestedFile === 'bundle.css' || requestedFile === 'bundle.js' ){
      var ext = path.extname(requestedFile).replace('.', '');
      hash = hash.replace( requestedFile, '' );
      var bundler = bundlers[hash];
      res.set( {'Content-Type': mime.lookup(requestedFile) } )
      return res.status(200).send(bundler.compiled[ext]);
    }

    if(!action){
      return next();
    }

    var fileToCompile = path.join( appPath, query.file );

    var bundler = bundlers[hash];
    if(!bundler){
      var bundlerOptions = {
        source: fileToCompile,
        gaston: true,
        testing: action === 'test',
        package: packagePath,
        sourceMaps: options.sourceMaps
      };

      bundler = bundlers[hash] = new Bundler( bundlerOptions );
    }

    var titlePath = fileToCompile.substr(fileToCompile.length - 15);
    var title = titlePath + ' - ' + pkg.name;
    bundler.bundle()
      .then(function(bundle){
        bundler.compiled = bundle;
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
