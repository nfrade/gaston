var fileLineRegex = /\/\*\ file: ([\w|\/|\-|\_|\.]+)/;

var parseLessError = module.exports = function parseLessError(errorObj){
  var err = errorObj.error;
  var lessCode = errorObj.originalLessCode;
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

  var code = '';

  for(var i = errorFileLine + 1, l = lines.length; i < l; i++){
    var line = lines[i];
    if( fileLineRegex.exec(line) ){
      break;
    }
    if( i !== errorFileLine + 1){
      code += '\n';
    }
    code += line;
  }

  return {
    errorType: 'Less',
    syntax: 'less',
    file: errorFile,
    line: lineInFile,
    message: err.message,
    code: code
  };

};