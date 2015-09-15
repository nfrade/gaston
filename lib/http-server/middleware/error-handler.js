"use strict";

var fs = require('vigour-fs-promised')
  , path = require('path')
  , replacer = require('./utils/replacer')
  , pad = require('../../utils/pad')
  , parseLessError = require('./error-parsers/less')
  , gastonFilesPath = path.join(__dirname, '../../..', 'gaston-files')
  , errorPagePath = path.join(gastonFilesPath, 'error.html');

var errorHandler = module.exports = function errorHandler(res, title){
  return function(err){
    var errorMessage, fileExtension, parsedError;
    // Watcher.addWatcher(err.filename);

    if(err.stream){
      delete err.stream;
    }

    if(err.lessCode){
      fileExtension = 'less';
      parsedError = parseLessError( err.error, err.originalLessCode );

    } else {
      errorMessage = err.message;
    }

    parsedError.title = 'ERR! ' + title;

    fs.createReadStream(errorPagePath)
      .pipe( replacer(parsedError) )
      .pipe( res );
  };
};
