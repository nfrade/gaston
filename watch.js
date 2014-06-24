var gaze = require('gaze')
  , log = require('npmlog')
  , path = require('path')
  , watched = []
  , file
  , i

function removeWatched (files) {
  i = files.length
  while ( i-- ) if( ~watched.indexOf(files[i]) ) files.splice(i, 1)
  watched = watched.concat(files) 
  return files
}

module.exports = function(files, callback){
  files = removeWatched(files)

  if( files.length )
    gaze(files, function(err) {
        log.info('watching', files)
        if ( err ) log.error(err)
      })
      .on('changed', function(filepath) {
        log.info('change',path.relative(process.cwd(), filepath))
        callback()
      })
}