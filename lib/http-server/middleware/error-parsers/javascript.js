var fs = require('vigour-fs-promised')
  , fileRegex = /parsing file\: ([\w|\/|\-|\_|\.]+)/
  , messageRegexp = /(.+)\(/
  , lineColumnRegexp = / (\(.+\))\s\(/
  , lineRegexp = /\((\d+)/;

var parseLessError = module.exports = function parseLessError(err){
  
  try { 
    var errorFile = fileRegex.exec(err.message)[1];
    var lineColumn = lineColumnRegexp.exec(err.message)[1];
    var message = messageRegexp.exec(err.message)[1].replace(lineColumn, '');
    var lineInFile = lineRegexp.exec(lineColumn)[1];
    var code = fs.readFileSync(errorFile, 'utf8');
    
    return {
      errorType: 'JavaScript',
      syntax: 'javascript',
      message: message,
      file: errorFile,
      line: lineInFile,
      code: code
    };
  } catch(ex){
    return {
      errorType: 'JavaScript',
      syntax: 'javascript',
      message: err.message,
      file: ' ',
      line: ' ',
      code: ' '
    }
  }
};