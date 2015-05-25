var log = require('npmlog')
  , through = require('through2')
  , path = require('path')
  , Bundler = require('../')
  , socketServer = require('../../server/socket-server')
  , repo = require('../../utils/repo')
  , vConfig = require('vigour-js/util/config')
  , hNow = require('../../utils/h-now')


module.exports = function(file, options){
  return through(function(buf, enc, next){
    var self = this;
    if( ~file.indexOf('/package.json') ){
      var parsed;
      parsed = JSON.parse( buf.toString() );
      parsed.sha = parsed.version;
      parsed.repository.branch = options.branch;
      if (parsed.repository.branch !== "staging") {
        parsed.version = hNow()
          + " "
          + "(" + parsed.sha + ")"
      }
      if( parsed.vigour ) {
        vConfig.parse(parsed.vigour
          , parsed
          , [{ 'repository.branch': 'branches' }])
      }
      
      var stringified = JSON.stringify(parsed);
      self.push( stringified );
      return next();
    }

    this.push(buf);
    next();

  });
};
