// TODO: create log.header and log.info from exposed factory

var s = require( './styles' )
var arg = require( '../utils/arg' )

module.exports = function info( text ) {
  var log = this
  log( '%c------------- ' + text, s.info )
  var args = arg( arguments, 1 )
  if( args.length ) {
    log.apply( console, args )
  }
}
