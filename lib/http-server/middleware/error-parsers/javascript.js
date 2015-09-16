var fs = require('vigour-fs-promised')
  , fileRegex = /Parsing file ([\w|\/|\-|\_|\.]+)\:/
  , messageRegexp = /\: (.+)/
  , lineColumnRegexp = / (\(.+)/
  , lineRegexp = /\((\d+)/;

var parseLessError = module.exports = function parseLessError(err){
  
  try {
    var errorFile = fileRegex.exec(err.message)[1];
    var wholeMessage = messageRegexp.exec(err.message)[1]
    var errorMessage = wholeMessage.replace(lineColumnRegexp, '');
    var lineColumn = lineColumnRegexp.exec(wholeMessage)[1];
    var lineInFile = lineRegexp.exec(lineColumn)[1];
    var code = fs.readFileSync(errorFile, 'utf8');
    
    return {
      errorType: 'JavaScript',
      syntax: 'javascript',
      message: errorMessage,
      file: errorFile,
      line: lineInFile,
      code: code
    };
  } catch(ex){
    return {}
  }
};