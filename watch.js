var gaze = require('gaze')
  , log = require('npmlog')
  , path = require('path')

  , watched = []
  , file
  , i

module.exports = function(files, callback){
  for (i = files.length - 1; i >= 0; i--) {
    file = files[i]
    if(~watched.indexOf(file)){
      files.splice(i, 1)
    }
  };
  watched = watched.concat(files)
  if(files.length)
    gaze(files, function(err, watcher) {
        for (var i = watched.length - 1; i >= 0; i--)
          log.info('watching', path.relative(process.cwd(), watched[i]))
        if(err) 
          log.error(err)
      })
      .on('changed', function(filepath) {
        log.info('change',path.relative(process.cwd(), filepath))
        callback()
      })
}