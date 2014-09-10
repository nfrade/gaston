var browserify = require('browserify')
var fs = require('graceful-fs')
var less = require('less')
var log = require('npmlog')
var path = require('path')
var through = require('through');
var watchify = require('watchify')
var watchifies = {}
var rebase = require('./rebase.js')

module.exports = function(entry, opts, callback) {
  var w = watchifies[entry]

  if(!w) w = createWatchify(entry,opts)
  if(!w._compiling) callback(null,watchifies)
  w._callback = callback
}

function createWatchify(entry,opts){
  var basedir = path.dirname(entry)
  var bundleOptions = {
      cache: {}, packageCache: {}, fullPaths: true
  }
  
  if(opts){
    bundleOptions.debug = opts.debug
    bundleOptions.ignoreMissing = opts.ignoreMissing
    bundleOptions.noParse = opts.noParse
  }

  var b = browserify(entry,bundleOptions)
  var w = watchifies[entry] = watchify(b)
  var transformOptions = {global:opts && opts.global || true}

  w.transform(transformOptions,handleDeps.bind(w))
  w._basedir = basedir
  w._cssdeps = {}

  w.on('log',log.info)
  w.on('update',compile)
  w.on('dep',perhapsCompileCSS)
  w.on('done',complete)

  compile.call(w)
  console.log(w)
  return w
}

function handleDeps(file){
  var w = this
  var todo
  var end
  if( isCSS(file) ){
    todo = function(){ this.push(null) }
    if(!w._cssprocessing) w._cssprocessing = 1
    else w._cssprocessing++
    fs.readFile(file, 'utf8', function(err,data){
      if(err) w._callback(err)
      rebaseCSS(w,file,data)
    })
  }

  return through(todo)
}

function rebaseCSS(w,file,data){
  var base = path.relative(w._basedir, path.dirname(file))
  if (base.length) base += '/'
  w._cssdeps[file] = rebase(data,base)
  if(!--w._cssprocessing && w._depscomplete) compileCSS(w)
}

function compile(){
  var w = this
  var output = path.join(w._basedir,'bundle.js')

  w._cssprocessing = false
  w._depscomplete = false
  w._compiling = true
  w._csscomplete = true
  w._jscomplete = false

  w.bundle(function(err,src){ if(err) w._callback(err) })
    .pipe(fs.createWriteStream(output)
      .on('finish', function (err) {
        if(err) w._callback(err)
        w.emit('done','js')
      }))
}

function complete(done){
  var w = this

  if(done === 'css') w._csscomplete = true
  if(done === 'js') w._jscomplete = true

  var everythingDone = w._csscomplete && w._jscomplete

  if(everythingDone){
    w._compiling = false
    if(w._imports){
      w._imports.forEach(function(importedFilename){
        w.emit('file',importedFilename)
      })
    }
    if(w._callback) w._callback(null,watchifies) 
  }

  log.info(done + ' bundle complete')
}


function perhapsCompileCSS(dep){
  var w = this
  var processing = w._cssprocessing
  if(!processing){
    if(updatedCSS(w) || processing === 0) compileCSS(w)
    w._cssprocessing = true //done
  }
  w._depscomplete = true
}

function compileCSS(w){
  var css = concatCSS(w)
  var output = path.join(w._basedir,'bundle.css')

  w._csscomplete = false

  less.Parser({paths:[w._basedir]}).parse(css, function (err, tree) {
    if(err) w._callback(err)
    var rules = tree.rules
    var i = rules.length - 1

    w._imports = []

    for (; i >= 0; i--) {
      var importedFilename = rules[i].importedFilename
      if(importedFilename && !~w._imports.indexOf(importedFilename)){
        w._imports.push(importedFilename)
        w.emit('file',importedFilename)
      }
    }

    try { 
      fs.writeFile(output,tree.toCSS(),function(err){
        if(err) w._callback(err)
        w.emit('done','css')
      })
    }
    catch (ex) { w._callback(ex) }
  })
}

function concatCSS(w){
  var cssarr = w._cssarr || updatedCSS(w)
  var merge = ''
  var i = 0
  for (; i < cssarr.length; i++) {
    var css = w._cssdeps[cssarr[i]]
    if(css) merge += css + '\n'
  }
  return merge
}

function updatedCSS(w){
  var arr = w._imports || []
  var prevarr = w._cssarr
  for(var file in w._mdeps.visited){
    if( isCSS(file) ) arr.push(file)
  }
  var theSame = prevarr && compareArray(prevarr,arr)

  if(!theSame) return w._cssarr = arr
}

function compareArray(a,b){
  var alength = a.length
  if(alength == b.length){
    for (var i = alength - 1; i >= 0; i--) {
      if(!~b.indexOf(a[i])) return false
    }
    return true
  }
}

function isCSS(file){
  if(~file.indexOf('.less') || ~file.indexOf('.css')) return true
}