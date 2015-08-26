// TODO: create log.header and log.info from exposed factory

var s = require( './styles' )
var arg = require( '../../utils/arg' )

module.exports = function header( text ) {
  var log = this
  log( '%c------------- ' + text, s.header )
  var args = arg( arguments, 1 )
  if( args.length ) {
    log.apply( console, args )
  }
}
