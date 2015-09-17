var path = require('path')
  , _ = require('lodash')
  , browserify = require('browserify')
  , watchify = require('watchify')
  , Blessify = require('gaston-blessify')
  , Smapify = require('gaston-smapify')
  , setAlias = require('./util/set-alias')

var build = module.exports = function build(){
  var self = this;
  var options = self.options;
  self.smapify = new Smapify(options);

  return new Promise(function(resolve, reject){

  });
};