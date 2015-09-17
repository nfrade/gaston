var Promise = require('bluebird')
  , browserify = require('browserify')
  , path = require('path')
  , fs = require('vigour-fs-promised')
  , config = require('../config');


module.exports = compile;

function compile (files) {

  return new Promise(function(fulfill, reject){
    var br = browserify(files);
    br.require( path.join(__dirname, '../..', 'node_modules/chai'), {
      expose: 'chai'
    } );
    var b = br.bundle();

    b.on('error', function(err){
      delete err.stream;
      reject(err);
    });

    var bundle = '';
    b.on('data', function(data){
      bundle += data.toString('utf8');
    });

    b.on('end', function(){
      fulfill(bundle);
    });

    b.pipe( fs.createWriteStream(config.bPath) )
  })
}
