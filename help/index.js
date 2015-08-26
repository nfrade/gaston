var log = require('npmlog')
  , fs = require('vigour-fs')
  , path = require('path')
  , topic = process.argv[3];

if(!topic){
  fs.createReadStream( path.join(__dirname, 'help.txt') )
    .pipe(process.stdout);
} else {
  var topicPath = path.join(__dirname, topic + '.txt' );
  fs.exists(topicPath, function(exists){
    if(exists){
      fs.createReadStream( topicPath )
        .pipe(process.stdout);
    } else {
      log.error('help', 'no command named ' + topic + ';');
      log.info('help', 'type "gaston help" for a list of commands');
    }
  });
}