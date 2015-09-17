var fs = require('vigour-fs-promised')
  , path = require('path')
  , replacer = require('./utils/replacer')
  , pad = require('../../utils/pad')
  , parseLessError = require('./error-parsers/less')
  , parseJsError = require('./error-parsers/javascript')
  , gastonFilesPath = path.join(__dirname, '../../..', 'gaston-files')
  , errorPagePath = path.join(gastonFilesPath, 'error.html');

var errorHandler = module.exports = function errorHandler(res, title){
  return function(err){
    var errorMessage, fileExtension, parsedError;

    if(err.lessCode){
      parsedError = parseLessError(err);

    } else {
      parsedError = parseJsError(err);
    }

    parsedError.title = 'ERR! ' + title;

    fs.createReadStream(errorPagePath)
      .pipe( replacer(parsedError) )
      .pipe( res );
  };
};
