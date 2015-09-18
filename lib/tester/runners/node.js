var log = require('npmlog')
  , path = require('path')
  , Mocha = require('mocha')
  , sinonChai = require('sinon-chai')
  , sinon = require('sinon')
  , chai = require('chai')
  , gastonLog = require('../../log')
  , getFiles = require('../utils/get-files')
  

var node = module.exports = function node(options, errors, dir){
  var testPath = options.file || path.join(options.source, dir || 'node');
  log.info('gaston tester', 'running node tests from', testPath);
  prepareGlobals();

  var mocha = new Mocha({
    ui: 'bdd'
  });

  var getFilesPromise;
  if(options.file){
    getFilesPromise = getFiles( options.file )
  } else {
    getFilesPromise = getFiles( options.source, dir || 'node' )
  }

  return getFilesPromise
    .then(function(files){
      for(var i = 0, l = files.length; i < l; i++){
        var file = files[i];
        mocha.addFile(file);
      };
    })
    .then(function(){
      return new Promise(function(resolve, reject){
        return mocha.run(function(code){
          resolve(errors + code);
        });
      });
    });
};

var prepareGlobals = function(){
  global.gaston = {};
  global.gaston.log = global.log = gastonLog;
  global.chai = chai;
  global.expect = global.chai.expect;
  global.assert = global.chai.assert;
  global.should = global.chai.should();
  global.sinon = sinon;
  chai.use( require( '../chai/performance' ) )
  chai.use( require( '../chai/message' ) )
  chai.use(sinonChai);
  global.console.clear = function(){};
  global.console.group = function(){};
  global.console.groupEnd = function(){};
  global.log.event = function(){};
};
