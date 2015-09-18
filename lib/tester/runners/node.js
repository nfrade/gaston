var Mocha = require('mocha')
  , sinonChai = require('sinon-chai')
  , sinon = require('sinon')
  , chai = require('chai')
  , log = require('../../log')
  , getFiles = require('../utils/get-files')
  

var node = module.exports = function node(source, errors, dir){
  prepareGlobals();

  var mocha = new Mocha({
    ui: 'bdd'
  });

  return getFiles( source, dir || 'node' )
    .then(function(files){
      for(var i = 0, l = files.length; i < l; i++){
        var file = files[i];
        mocha.addFile(file);
      };
    })
    .then(function(){
      return new Promise(function(resolve, reject){
        return mocha.run(function(failures){
          resolve(failures);
        });
      });
    });
};

var prepareGlobals = function(){
  global.gaston = {};
  global.gaston.log = global.log = log;
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
