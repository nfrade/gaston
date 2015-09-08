var log = exports

var methods = {
  header: require( './header' ),
  info: require( './info' )
}

log.level = true
log.make = makeLogger

function makeLogger( label ) {
  var logger = log[label]
  if( !logger ) {
    logger = makeChecked( console, console.log, label )
    makeShimmed( console, logger, label )
    for( var i in methods ) {
      logger[i] = methods[i]
    }
    log[label] = logger
  }
  return logger
}

function makeChecked( from, fn, label ) {
  return function checked() {
    var level = log.level
    var on = (
      level === true ||
      level === label ||
      level && level[label]
    ) && log[label].enabled

    if( on ) {
      fn.apply( from, arguments )
    }
  }
}

function makeShimmed( from, to, label ) {
  for( var key in from ) {
    var fn = from[key]
    if( typeof fn === 'function' ) {
      to[key] = makeChecked( from, fn, label )
    }
  }
}
