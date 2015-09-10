var log = require('npmlog')
  , path = require('path')
  , gaston = require('../../')
  , config = require('../../../config.json')


var start = module.exports = function start(args){
  var options = {
    basePath: getBasePath(args, config),
    port: args.port || args.p || config['http-port']
  };
  return gaston.start(options)
    .then(function(server){
      log.info('gaston', 'http server listening on port', server.port);
    });
};

var getBasePath = function getBasePath(args, config){
  var basePath = args.b || args['base-path'];
  if( basePath ){
    return path.join( process.cwd(), basePath )
  }

  basePath = config['base-path'];
  if(basePath){
    if(basePath.indexOf(path.sep) === 0){
      return basePath;
    }
    var homeDir = process.env.HOME || process.env.USERPROFILE;
    return path.join( homeDir, basePath );
  }
  return process.cwd();
};