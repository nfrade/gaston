var minimist = require('minimist')
  , path = require('path')
  , through = require('through2')
  , fs = require('vigour-fs-promised')
  , gaston = require('../lib/gaston')
  , config;

var args = minimist(process.argv);

var build = module.exports = function(cfg){
  var fileToCompile, buildSource, destination, isBase;
  config = cfg;
  if( args.s || args.source ){
    buildSource = path.join( config.basePath, (args.s || args.source) );
    destination = path.dirname(buildSource) + '/';
  } else {
    isBase = true;
    buildSource = config.gaston.main || ( process.cwd() + '/' );
    destination = config.basePath;
  }
  var stats = fs.statSync(buildSource);
  if( stats.isDirectory() ){
    fileToCompile = path.join(buildSource, 'index.js');
  } else {
    fileToCompile = buildSource;
    if( !~fileToCompile.indexOf(config.basePath) ){
      fileToCompile = path.join(config.basePath, fileToCompile);
    }
    buildSource = path.dirname( buildSource ) + '/';
  }

  destination = path.join( destination, config.gaston.build || 'build' );

  var destinationHTML;
  if( path.extname(destination) === '.html' ){
    destinationHTML = destination;
    destination = path.dirname( destination );
  }

  return gaston.build(config, fileToCompile, destination, isBase)
    .then(function(){
      var indexPath = path.join( buildSource, 'index.html' );
      if( !fs.existsSync(indexPath) ){
        indexPath = path.join( config.basePath, 'index.html' );
      }
      if( !fs.existsSync(indexPath) ){
        indexPath = path.join( __dirname, '../gaston-files/bootstrap/', 'build.html');
      }
      var targetIndexPath = destinationHTML || path.join(destination, 'index.html');
      var rStream = fs.createReadStream(indexPath);
      var wStream = fs.createWriteStream(targetIndexPath);

      wStream.on('close', function(){
        process.exit(0);
      })

      rStream.pipe( through(function(buf, enc, next){
        var data = buf.toString('utf8');
        data = data.replace('{{title}}', config.pkg.name);
        data = data.replace('bundle.js', 'build.js');
        data = data.replace('bundle.css', 'build.css');
        this.push(data);
        return next();
      }) )
      .pipe(wStream);

    });
};