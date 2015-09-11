var log = require('npmlog')
  , path = require('path')
  , gaston = require('../../')
  , config = require('../../../config.json')
  , getBasePath = require('../../utils/get-base-path')


var start = module.exports = function start(args){
  var options = {
    basePath: getBasePath(args.b || args['base-path'], config),
    port: args.port || args.p || config['http-port']
  }; console.log(options);
  return gaston.start(options)
    .then(function(server){
      log.info('gaston', 'http server listening on port', server.port);
      log.info('gaston', 'http://' + server.ip + ':' + server.port + '/');
    });
};

