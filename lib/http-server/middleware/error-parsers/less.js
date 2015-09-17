var fileLineRegex = /\/\*\ file: ([\w|\/|\-|\_|\.]+)/;

var parseLessError = module.exports = function parseLessError(errorObj){
  var err = errorObj.error;
  var lessCode = errorObj.originalCode;
  var lines = lessCode.split('\n');
  var errorLine = err.line - 1;
  var errorFile, fileLine, lineInFile;

  for(var i = errorLine - 1; i >= 0; i--){
    var fileLine = lines[i];
    var match = fileLineRegex.exec(fileLine);
    
    if(match){
      fileLine = i;
      errorFile = match[1];
      lineInFile = errorLine - fileLine;
      break;
    }
  }

  var code = '';

  for(var i = fileLine + 1, l = lines.length; i < l; i++){
    var line = lines[i];
    if( fileLineRegex.exec(line) ){
      break;
    }
    if( i !== fileLine + 1){
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