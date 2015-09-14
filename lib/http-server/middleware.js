"use strict";

var fs = require('vigour-fs-promised')
  , path = require('path')
  , url = require('url')
  , mime = require('mime')
  , through = require('through2')
  , Bundler = require('../bundler')
  , backtrackFile = require('../utils/backtrack-file')
  // , Watcher = require('../bundler/watcher')
  , gastonFilesPath = path.join(__dirname, '../..', 'gaston-files')
  , indexPagePath = path.join(gastonFilesPath, 'index.html')
  , errorPagePath = path.join(gastonFilesPath, 'error.html')
  , testPagePath = path.join(gastonFilesPath, 'test.html')
  , fileLineRegex = /\/\*\ file: ([\w|\/|\-|\_|\.]+)/;

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
          .pipe( replacer('{{title}}', title) )
          .pipe( res );
      })
      .catch( errorHandler(res, title) );
  };

};

var errorHandler = function errorHandler(res, title){
  return function(err){
    var errorMessage, fileExtension;
    // Watcher.addWatcher(err.filename);

    if(err.stream){
      delete err.stream;
    }

    if(err.lessCode){
      fileExtension = 'less';
      errorMessage = 'Error compiling less</br>';
      errorMessage += 'Message: ' + err.error.message + '<br>';
      errorMessage += parseLessError( err.error, err.originalLessCode );

    } else {
      errorMessage = err.message;
    }

    fs.createReadStream(errorPagePath)
      .pipe( replacer('{{title}}', 'ERR! ' + title) )
      .pipe( replacer('{{error}}', errorMessage) )
      .pipe( res );
  };
};

var replacer = function (placeHolder, value){
  return through(function replacer(buf, enc, next){
    var data = buf.toString('utf8');
    data = data.replace(placeHolder, value);
    this.push(data);
    return next();
  });
};

var parseLessError = function parseLessError(err, lessCode){
  var lines = lessCode.split('\n');
  var errorLine = err.line;
  var errorFile, errorFileLine, lineInFile;

  for(var i = errorLine; i >= 0; i--){
    var fileLine = lines[i];
    var match = fileLineRegex.exec(fileLine);
    
    if(match){
      errorFileLine = i;
      errorFile = match[1];
      lineInFile = err.line - errorFileLine;
      break;
    }
  }

  var html = 'file: ' + errorFile + '<br>';
  html += 'line: ' + lineInFile + '<br>';
  html += '<pre id="code"><code class="less">';
  
  for(var i = errorFileLine + 1, l = lines.length; i < l; i++){
    var line = lines[i];
    if( fileLineRegex.exec(line) ){
      break;
    }

    html += '<span style="' + (i === errorLine? 'color:red' : '') +'">';
    html += pad(i - errorFileLine, 5) + '| ' + line + '\n';
    html += '</span>';
  }
  html += '</code></pre>';

  return html;
};

var pad = function pad(val, size){
  var s = val+"";
  while (s.length < size) s = " " + s;
  return s;
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
