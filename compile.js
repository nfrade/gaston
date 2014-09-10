var browserify = require('browserify')
var fs = require('graceful-fs')
var less = require('less')
var log = require('npmlog')
var path = require('path')
var through = require('through');
var watchify = require('watchify')
var watchifies = {}
var rebase = require('./rebase.js')

module.exports = function(entry, opts, cb) {
  var index = entry || './index.js'
  var w = watchifies[index] 

  if(!w){
    var basedir = path.dirname(entry)
    var bundleOptions = watchify.args   
    
    if(opts){
      bundleOptions.debug = opts.debug
      bundleOptions.ignoreMissing = opts.ignoreMissing
    }

    var b = browserify(index,bundleOptions)
    w = watchifies[index] = watchify(b)

    w.transform({global:opts && opts.global || true},function(file){ return handleDeps(w,file) })
    w._basedir = basedir

    w.on('log', function (msg) { log.info('watchify',msg) })
    w.on('update',compile)
    w.on('dep',perhapsCompileCSS)
    w.on('done',fileDone)

    compile.call(w)
  }

  w._callback = cb

  if(!w._compiling) cb(null,watchifies)
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

function perhapsCompileCSS(dep){
  var processing = this._cssprocessing
  if(!processing){
    if(updatedCSS(this) || processing === 0){
      compileCSS(this)
    }
    this._cssprocessing = true //complete
  }
  this._depscomplete = true
}

function fileDone(done){
  if(done === 'css'){
    log.info('css bundle complete')
    this._csscomplete = true
  }
  if(done === 'js'){
    log.info('js bundle complete')
    this._jscomplete = true
  }

  var everythingDone = this._csscomplete && this._jscomplete

  if(everythingDone){
    this._compiling = false
    if(this._callback) this._callback(null,watchifies) 
  }
}

//compiles css/less to final bundle.css
function compileCSS(w){
  w._csscomplete = false
  var css = concatCSS(w)
  var output = path.join(w._basedir,'bundle.css')
  less.Parser({paths:[w._basedir]}).parse(css, function (err, tree) {
    if(err) w._callback(err)
    try { 
      fs.writeFile(output,tree.toCSS(),function(err){
        if(err) w._callback(err)
        w.emit('done','css')
      })
    }
    catch (ex) { w._callback(ex) }
  })
}

//concatenates css
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

//check if there is a change in css dependencies
function updatedCSS(w){
  var arr = []
  var prevarr = w._cssarr
  for(var file in w._mdeps.visited){
    if( isCSS(file) ) arr.push(file)
  }
  var theSame = prevarr && compareArray(prevarr,arr)
  if(!theSame) return w._cssarr = arr
}

//compareArrayContents only for contents => NOT order
function compareArray(a,b){
  if(a.length == b.length){
    for (var i = a.length - 1; i >= 0; i--) {
      if(!~b.indexOf(a[i])) return false
    }
    return true
  }
}

//checks if file is css or less
function isCSS(file){
  if(~file.indexOf('.less') || ~file.indexOf('.css')) return true
}

//handles deps, rejecting css and less, sending them to css parser
function handleDeps(w,file){
  if( isCSS(file) ){
    if(!w._cssdeps) w._cssdeps = {}
    w._cssprocessing = (w._cssprocessing || 0) + 1
    fs.readFile(file, 'utf8', function(err,data){
      if(err) w._callback(err)
      rebaseCSS(w,file,data)
    })
    return through(function(){this.push(null)})
  }
  return through()
}

//rebases css
function rebaseCSS(w,file, data){
  var base = path.relative(w._basedir, path.dirname(file))
  if (base.length) base += '/'
  w._cssdeps[file] = rebase(data,base)
  if(!--w._cssprocessing && w._depscomplete) compileCSS(w)
}