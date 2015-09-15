"use strict";
var fileLineRegex = /\/\*\ file: ([\w|\/|\-|\_|\.]+)/;

var parseLessError = module.exports = function parseLessError(errorObj){
  var err = errorObj.error;
  var lessCode = errorObj.originalLessCode;
  var lines = lessCode.split('\n');
  var errorLine = err.line;
  var errorFile, errorFileLine, lineInFile;

  for(let i = errorLine; i >= 0; i--){
    let fileLine = lines[i];
    let match = fileLineRegex.exec(fileLine);
    
    if(match){
      errorFileLine = i;
      errorFile = match[1];
      lineInFile = err.line - errorFileLine;
      break;
    }
  }

  var code = '';

  for(let i = errorFileLine + 1, l = lines.length; i < l; i++){
    let line = lines[i];
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