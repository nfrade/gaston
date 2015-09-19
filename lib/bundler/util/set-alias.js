var aliasify = require('aliasify')
  , _ = require('lodash')
  , path = require('path')
  , config = require('../../../config/gaston.json')
  , backtrackFile = require('../../utils/backtrack-file');

var setAlias = module.exports = function setAlias(b, options){
  options = options || {};
  if(options.naked){
    return;
  }

  var packagePath = options.package; 
  if(!packagePath){
    var source = Array.isArray(options.source)? options.source[1] : options.source;
    packagePath = backtrackFile( 'package.json', path.dirname(source) );
  }
  var basePath = path.dirname(packagePath);
  try {
    var package = require(packagePath);
    var aliases = {};
    var requirePaths = config['aliasify'];
    if(requirePaths){
      aliases = _.extend(aliases, requirePaths, function(v, o){
        return path.join(basePath, o);
      });
    }
    aliases[package.name] = basePath;
    aliases['~'] = basePath;

    b.transform(aliasify, {
      aliases: aliases,
      verbose: false
    });  
  } catch(ex){
    
  }

  
};