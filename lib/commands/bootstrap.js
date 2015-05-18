
function createStaticFiles(){
  readdir(filesPath)
    .then(function(files){
      var complete = 0;
      var handler = function(){
        if(++complete === files.length){
          log.info('gaston', 'necessary files were created')
        }
      };
      files.forEach(function(file){
        var rPath = path.join(filesPath, file);
        var wPath = path.join(basePath, file); 
        var wStream = fs.createWriteStream(wPath);
        wStream.on('close', handler);
        fs.createReadStream(rPath)
          .pipe(wStream);
      });
    });

  var writeIndex = fs.createWriteStream( path.join(process.cwd(), 'index.html') );
    writeIndex.on('close', function(){
      log.info('gaston', 'index.html created');
    })
  fs.createReadStream( path.join(filePath, 'index.html'))
    .pipe( writeIndex);
}