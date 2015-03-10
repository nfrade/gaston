var browserify = require('browserify')
var fs = require('graceful-fs')
var less = require('less')
var log = require('npmlog')
var path = require('path')
var through = require('through');
var watchify = require('watchify')
var watchifies = {}
var rebase = require('./rebase.js')
var vUtil = require('vigour-js/util')
var vConfig = require('vigour-js/util/config')
var vConfigUA = require('vigour-js/util/config/ua')
var stream = require('stream')
var util = require('util')
var pkgPath
module.exports = exports = {}

exports.main = function (entry, opts, callback) {
  var w = watchifies[entry]
  pkgPath = opts.pkgPath
  if(!w) w = createWatchify(entry,opts)
  if(!w._compiling) callback(null,watchifies)
  w._callback = callback
}

exports.release = function (entry, opts, callback) {
  var bundleOptions = {
      cache: {}, packageCache: {}, fullPaths: false
    }
    , b = browserify(entry, bundleOptions)

  b.transform({ global:true }, releaseTransform)
  b.bundle(callback)
}

function releaseTransform (file) {
  var todo
  if (isCSS(file)) {
    todo = function () {
      this.push(null)
    }
  }
  return through(todo)
}

function createWatchify(entry,opts){
  var basedir = path.dirname(entry)
  var bundleOptions = {
      cache: {}, packageCache: {}, fullPaths: true
  }
  
  if(opts){
    bundleOptions.debug = opts.debug
    bundleOptions.ignoreMissing = opts.ignoreMissing !== void 0 
      ? opts.ignoreMissing
      : true
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

function Inform (pkg, options) {
  var parsed = JSON.parse(pkg)
  this.done = false
  parsed.sha = process.env.SHA || 'unknown SHA'
  parsed.repository.branch = process.env.BRANCH || 'staging'
  if (parsed.repository.branch !== "staging") {
    parsed.version = hNow()
      + " "
      + "(" + parsed.sha + ")"
  }
  vConfig.parse(parsed.vigour
    , parsed
    , [{ 'repository.branch': 'branches' }])
  var uaSpecific = vUtil.clone(parsed)
  vConfig.parse(uaSpecific.vigour
    , uaSpecific
    , vConfigUA
    , { ua: 'android'})
  this.pkg = "window.package=" + JSON.stringify(uaSpecific) + ";"
  stream.Transform.call(this, options)
}
util.inherits(Inform, stream.Transform)

Inform.prototype._transform = function (chunk, enc, cb) {

  if (!this.done) {
    this.push(this.pkg, "utf8")
    this.done = true
  }
  this.push(chunk.toString())
  cb()
}

function compile(){
  var self = this
  fs.readFile(pkgPath, function (err, str) {
    var w = self
    var output = path.join(w._basedir,'bundle.js')
    var transform = true
    try {
      var inform = new Inform(str)
    } catch (e) {
      log.error("Can't prepare package", e)
      transform = false
    }
    w._cssprocessing = false
    w._depscomplete = false
    w._compiling = true
    w._csscomplete = true
    w._jscomplete = false

    var bundle = w.bundle(function(err,src){ if(err) w._callback(err) })
    if (transform) {
      bundle = bundle.pipe(inform)
    }
    bundle = bundle.pipe(fs.createWriteStream(output)
      .on('finish', function (err) {
        if(err) w._callback(err)
        w.emit('done','js')
      }))
  })
  
  
}

function hNow () {
  var date = new Date()
    , dateTime = date.getUTCFullYear()
      + "/"
      + pad(date.getUTCMonth() + 1, 2)
      + "/"
      + pad(date.getUTCDate(), 2)
      + " "
      + pad(date.getUTCHours(), 2)
      + ":"
      + pad(date.getUTCMinutes(), 2)
      + ":"
      + pad(date.getUTCSeconds(), 2)
      + " UTC"

  function pad (val, nbDigits) {
    var missing = nbDigits - val.toString().length
    while (missing > 0) {
      val = "0" + val
      missing -= 1
    }
    return val
  }
  return dateTime
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
  var now = new Date()
  log.info(done + ' bundle complete ' + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds())
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

  less.Parser({ paths:[w._basedir], relativeUrls:true }).parse(css, function (err, tree) {
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