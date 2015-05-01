var gaston = require('../lib');

var options = {
  path: process.cwd(),
  building: true,
  bump: 'revision'
}

module.exports = {
  run: function(opt){
    opt = opt || {};
    options.path = opt.path || options.path;
    options.bump = opt.bump || options.bump;
    gaston.build(options)
      .then(
        function(){
          log.info('GASTON-CLI', 'SUCCESS');
          if( !options.keepalive ){
            // process.exit(0);
          }
        },
        function(err){
          log.error('GASTON-CLI', err);
          if( !options.keepalive ){
            // process.exit(1);
          }
        }
      );
  }
};