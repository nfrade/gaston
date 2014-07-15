var fs = require('graceful-fs')
  , watchify = require('watchify')
  , through = require('through2')
  , path = require('path')
  , log = require('npmlog')
  , compileLess = require('./compile-less')
  , server = require('./server')

var w = watchify()
  , lessFiles = []
  , dirname

module.exports = function(p,port,close,debug){
  if(!p) p = path.join(process.cwd(),'index.js')

  dirname = path.dirname(p)

  w.add(p)
  .transform({global:true},transform)
  .bundle({debug:debug})
  .on('error',function(err){ log.error(err) })
  .pipe(fs.createWriteStream(path.join(dirname,'bundle.js')))

  w.on('log', ready )
  w.on('update', update )


  function update(msg) {
    log.info('update',msg)
    module.exports(p,port,close,debug)
  }

  function ready(msg) {
    log.info('ready',msg)
    compileLess(lessFiles,dirname)
    if(close) w.close()
    else server(port)
  }

  function transform (file) {
    if (/(\.less$)|(\.css$)/.test(file)){
      var files = findFiles(file)
        , i = files.length - 1
        , fl
      for (; i >= 0;) {
        fl = files[i--]
        if(!~lessFiles.indexOf(fl)) lessFiles.unshift(fl)
      }
      var stream = through(function() {})
      stream.push(null)
      return stream
    }
    return through()
  }

}

function findImports (string, nested) {
  var found = string.match(/@import([\s\S]*?)\((.*?)\);?/g)
    , i = (found || []).length - 1
    , imports
    , files = []
    , file
    , from = path.relative(dirname, nested)
    , to

  for (; i >= 0;){
    to = found[i--].match(/url\(("|')?(.*?)("|')?\)/)[2]
    file = path.join(from, to)
    if (fs.existsSync(file)){
      files = findFiles(file)
      log.info('@import', file)
    }
    else {
      log.error('can\'t find @import file', file)
    }
  }
  return files
}

function findFiles (file) {
  var string = fs.readFileSync(file, 'utf8')
    , imports = findImports(string, path.dirname(file))
    , files = [file].concat(imports)
  return files
}
