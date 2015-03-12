var log = require('npmlog')
	, fs = require('fs')
	, path = require('path')

exports.asyncEach = function (arr, action, cb) {
	var l = arr.length
		, nbLeft = l
		, i
		, errors = []
	for (i = 0; i < l; i += 1) {
		action(arr[i], function (err) {
			if (err) {
				errors.push(err)
				nbLeft -= 1
				done()
			} else {
				nbLeft -= 1
				done()
			}
		})
	}
	function done () {
		if (cb && nbLeft === 0) {
			if (errors.length > 0) {
				cb(errors)
			} else {
				cb(null)
			}
		}
	}
}

var tries = 0

exports.findPackage = function( pck, orig, start ) {

	log.info( 'search for package.json', pck )

  if( !orig ) {

  	var arr = pck.split('/')
  	arr.pop()
  	orig = arr.join('/')
  }

  if( !start ) {
  	tries = 0
  	start = path.basename( pck )
  }

  var existst = fs.existsSync( pck )

  if(pck && !existst) {
  	tries++
  	var base = path.dirname(pck)
  		, seg = ''

  	for(var i = 0; i < tries; i++) {
  		seg+='../'
  	}

    pck = path.join( orig, path.join( seg, start ) )

    if( tries === 10 ) {
      log.error('cannot find package.json tried 10 directories up')
    } else {
      return exports.findPackage( pck, orig, start )
    } 
  }
  
  return pck

}