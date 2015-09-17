var aliasify = require('aliasify')
  , config = { gaston: {} }; //[TODO] find out where to get the config

var setAlias = module.exports = function setAlias(b){
  var aliases = {};
  var requirePaths = config.gaston['require-paths']
  if(requirePaths){
    aliases = _.extend(aliases, requirePaths, function(v, o){
      return path.join(config.basePath, o);
    });
  }
  // aliases[config.pkg.name] = config.basePath;
  aliases['~'] = config.basePath;

  b.transform(aliasify, {
    aliases: aliases,
    verbose: false
  });
};