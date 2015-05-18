var log = require('npmlog')
  , npm = require('npm')
  , fs = require('graceful-fs')
  , path = require('path')
  , prompt = require('prompt')
  , denodeify = require('denodeify')
  , npmLoad = denodeify( npm.load )
  , npmInit = denodeify( npm.init )
  , readFile = denodeify( fs.readFile )
  , writeFile = denodeify( fs.writeFile )
  , readdir = denodeify( fs.readdir )
  , promptGet = denodeify( prompt.get )
  , repo = require('../lib/utils/repo')
  , backtrackFile = require('../lib/utils/backtrack-file')
  , basePath = process.cwd()
  , filesPath = path.join(__dirname, '../gaston-files/');

npmLoad()
  .then( checkForPackage )
  .then(function(data){
    project = data;
    project.pkg = require( path.join(project.location, 'package.json') );
    return project;
  })
  .then( checkForGitRepo )
  .then( copyGastonJson )
  .then(function(project){
    console.log(project);
  })

function copyGastonJson(project){
  return new Promise(function(fulfill, reject){
    var gastonJsonPath = path.join(project.location, 'gaston.json');
    if( fs.existsSync(gastonJsonPath) ){
      log.info('gaston', 'gaston.json already exists ');
      project.gaston = require(gastonJsonPath);
      return fulfill(project);
    }
    var wStream = fs.createWriteStream( gastonJsonPath );
    wStream.on('close', function(){
      log.info('gaston', 'created gaston.json configuration file ');
      project.gaston = require(gastonJsonPath);
      fulfill(project);
    })
    fs.createReadStream( path.join(filesPath, 'gaston.json') )
      .pipe( wStream );
    });
}

function checkForPackage(err, npm){
  var pkgPath = backtrackFile('package.json');
  if(pkgPath){
    var pkgLocation = pkgPath.replace(path.sep + 'package.json', '');

    if(pkgLocation === process.cwd()){
      log.info('gaston', 'there is already a package.json in this directory');
      return {
        isRoot: true,
        location: pkgLocation
      };
    } else {
      log.info('gaston', 'root of the project is ' + pkgLocation);
      return {
        isRoot: false,
        location: pkgLocation
      };
    }
  } else {
    log.info('gaston', 'running npm init in the current working directory');
    return npmInit()
      .then(function(){
        return {
          isRoot: true,
          location: process.cwd()
        };
      });
  }
}

function checkForGitRepo(project){
  var gitExists = fs.existsSync( path.join(project.location, '.git') );
  if(!gitExists){
    basePath = process.cwd();
    log.info('gaston', 'initializing git repo in ' + project.location);
    return repo.init(project.location)
      .then(function(){
        log.info('gaston', 'initted git repository');
        return project;
      });
  } else {
    log.info('gaston', 'git repository already present');
  }
  return project;
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