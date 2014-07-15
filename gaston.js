var fs = require('graceful-fs')
  , watchify = require('watchify')
  , through = require('through2')
  , path = require('path')
  , log = require('npmlog')
  , compileLess = require('./compile-less')
  , server = require('./server')

var w = watchify()
  , lessFiles = []

module.exports = function(p,port,close,debug){
  if(!p) p = path.join(process.cwd(),'index.js')

  w.add(p)
    .transform(transform)
    .bundle({debug:debug})
    .pipe(fs.createWriteStream('bundle.js'))

  w.on('log', ready )
  w.on('update', update )


  function update(msg) {
    log.info('update',msg)
    compileLess(lessFiles)
  }

  function ready(msg) {
    log.info('ready',msg)
    compileLess(lessFiles)
    if(close) w.close()
    else server(port)
  }

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

    return through(function (buf, enc, next) {
      this.push('') 
      next()
    })
  }
  return through()
}

function findImports (string, nested) {
  var found = string.match(/@import([\s\S]*?)\((.*?)\);?/g)
    , i = (found || []).length - 1
    , imports
    , files = []
    , file
    , from = path.relative(process.cwd(), nested)
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
