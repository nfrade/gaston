var gaze = require('gaze')
  , log = require('npmlog')
  , path = require('path')
  , watched = []
  , file
  , i

function checkIfWatched (files) {
  i = files.length
  while ( i-- ) if( ~watched.indexOf(files[i]) ) files.splice(i, 1)
  watched = watched.concat(files) 
}

module.exports = function(files, callback){
  checkIfWatched(files)
  if( files.length )
    gaze(files, function(err) {
        i = watched.length
        while ( i-- ) log.info('watching', path.relative(process.cwd(), watched[i]))
        if ( err ) log.error(err)
      })
      .on('changed', function(filepath) {
        log.info('change',path.relative(process.cwd(), filepath))
        callback()
      })
}