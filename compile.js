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
    var output = path.join(basedir,'bundle.js')
    var bundleOptions = watchify.args   
    
    if(opts){
      bundleOptions.debug = opts.debug
      bundleOptions.ignoreMissing = opts.ignoreMissing
    }

    var b = browserify(index,bundleOptions)
    w = watchifies[index] = watchify(b)

    w.transform({global:opts && opts.global || true},function(file){ return handleDeps(w,file) })
    
    w._basedir = basedir

    w.on('done',function(){
      w._compiling = false
      if(w.__cb) w.__cb(null,watchifies) 
    })
    w.on('log', function (msg) { log.info('watchify',msg) })
    w.on('update', function(){ compile(w,output) })
    w.on('dep', function(dep){
      var processing = w._cssprocessing
      if(!processing){
        if(cssDepsChanged(w) || processing === 0){
          compileCSS(w)
        }
        w._cssprocessing = true //complete
      }
      w._depscomplete = true
    })
    compile(w,output,cb)
  }

  w.__cb = cb
  if(!w._compiling) cb(null,watchifies)
}

function compile(w,output){
  w._cssprocessing = false
  w._depscomplete = false
  w._compiling = true

  w.bundle(function(err,src){ if(err) w._callback(err) })
    .pipe(fs.createWriteStream(output)
      .on('finish', function () {
        log.info('js written:', output)
        w._jswritten = true
        if(w._csswritten) w.emit('done')
      }))
}

//compiles css/less to final bundle.css
function compileCSS(w){
  var css = concatCSS(w)
  if(!css) return
  var output = path.join(w._basedir,'bundle.css')

  less.Parser({paths:[w._basedir]}).parse(css, function (err, tree) {
    if(err) w._callback(err)
    try { 
      fs.writeFile(output,tree.toCSS(),function(err){
        if(err) w._callback(err)
        w._csswritten = true
        log.info('css written:', output)
        if(w._jswritten) w.emit('done')
      })
    }
    catch (ex) { w._callback(ex) }
  })
}

//concatenates css
function concatCSS(w){
  var merge = ''
  var cssarr = w._cssarr
  for (var i = 0; i < cssarr.length; i++) {
    var css = w._cssdeps[cssarr[i]]
    if(css) merge += css + '\n'
  }
  return merge
}

//check if there is a change in css dependencies
function cssDepsChanged(w){
  var arr = []
  for(var file in w._mdeps.visited){
    if( isCSS(file) ) arr.push(file)
  }
  if(w._cssarr !== arr){
    w._cssarr = arr
    return true 
  }else{
    w._cssprocessing = true //complete
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