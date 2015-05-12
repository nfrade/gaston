var log = require('npmlog')
  , npm = require('npm')
  , fs = require('graceful-fs')
  , denodeify = require('denodeify')
  , npmLoad = denodeify(npm.load)
  , npmInit = denodeify(npm.init)
  , readFile = denodeify( fs.readFile )
  , writeFile = denodeify( fs.writeFile )
  , readdir = denodeify(fs.readdir)
  , path = require('path')
  , repo = require('../lib/utils/repo')
  , basePath = process.cwd()
  , filesPath = path.join(__dirname, '../files/')
  , exampleGaston = require('../files/gaston.json')
  , currentGaston
  , pkg;

npmLoad()
  .then( npmInit )
  .then( gitInit )
  .then( createStaticFiles );


function npmInit(err, npm){
  log.info('gaston', 'running \'npm init\'');
  return npmInit();
};

function gitInit(){
  log.info('gaston', 'running \'git init\'');
  return repo.init(basePath)
    .then(function(){
      log.info('gaston', 'initted git repository');
    });
};

function writeGastonJson(){
// console.log(ex)
  var json = JSON.stringify(exampleGaston, null, 4);
  return writeFile( path.join(basePath, 'gaston.json') , json, 'utf8')
    .then(function(){
      log.info('gaston', 'gaston.json created with default values');
    });
}

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

function exit(){
  log.info('exiting');
  process.exit(0);
};