var fs = require('vigour-fs-promised')
  , path = require('path')
  , mime = require('mime')
  , mochaDir = path.join( __dirname, '../..', 'node_modules', 'mocha' );

var mochaMiddleware = module.exports = function mochaMiddleware(req, res, next){
  var fileName = req.url.split('/').pop();
  if( !~fileName.indexOf('mocha.') ){
    return next();
  }

  var fileToServe = path.join( mochaDir, fileName);
  res.set( {'Content-Type': mime.lookup(fileToServe) } );
  fs.createReadStream( fileToServe )
    .pipe( res );
};