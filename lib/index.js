
var log = require('npmlog')
  , server = require('./server')
  , Bundler = require('./bundler')
  , bumpup = require('./utils/bumpup');

var Gaston = module.exports = {
  dev: function(options){
    server.start(options);
  },
  build: function(options){
    Bundler.setup(options);
    return Bundler.compile()
      .then(function(){
        return bumpup(options.path, options.bump)
          .then(function(newVersion){
            log.info('GASTON-CLI', 'bumped up version to ', newVersion);
          });
      })
      .then(
        function(){
          log.info('GASTON-CLI', 'SUCCESS');
          process.exit(0);
        },
        function(err){
          log.error('GASTON-CLI', err);
          process.exit(1);
        }
      )
  }
};