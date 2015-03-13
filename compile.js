var browserify = require('browserify')
  , fs = require('graceful-fs')
  , less = require('less')
  , log = require('npmlog')
  , path = require('path')
  , through = require('through')
  , watchify = require('watchify')
  , watchifies = {}
  , rebase = require('./rebase.js')
  , vUtil = require('vigour-js/util')
  , vConfig = require('vigour-js/util/config')
  , vConfigUA = require('vigour-js/util/config/ua')
  , stream = require('stream')
  , util = require('util')
  , myUtils = require('./util')
  , Promise = require('promise')
  , readFile = Promise.denodeify(fs.readFile)
  , pkgPath

module.exports = exports = {}

exports.main = function (entry, opts, callback) {
  var w = watchifies[entry]
  pkgPath = opts.pkgPath

  pkgPath = myUtils.findPackage( pkgPath )

  if(!w) w = createWatchify(entry,opts)
  if(!w._compiling) {
    callback(null,watchifies)
  }
  w._callback = callback
}

exports.release = function (entry, opts, callback) {
  //option ignring
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
    // bundleOptions.ignoreMissing = opts.ignoreMissing !== void 0 
    //   ? opts.ignoreMissing
    //   : true
    bundleOptions.noParse = opts.noParse
  }

  var b = browserify(entry,bundleOptions)
  var w = watchifies[entry] = watchify(b)
  var transformOptions = {global:opts && opts.global || true}

  w.transform(transformOptions,handleDeps.bind(w))
  w._basedir = basedir
  w._cssdeps = {}
  w._branch = opts.branch

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
  if( file.indexOf('node_modules/chai') !== -1 
   || file.indexOf('node_modules/mocha') !== -1 
   || file.indexOf('node_modules/browserify') !== -1 
   || file.indexOf('node_modules/trough') !== -1 ) 
  {
    todo = function(){ this.push(null) }
  }else if( isCSS(file) ){
    todo = function(){ this.push(null) }
    if(!w._cssprocessing) w._cssprocessing = 1
    else w._cssprocessing++
    fs.readFile(file, 'utf8', function(err,data){
      if(err) {
        w._callback(err)
      }
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

function Inform (options) {
  this.fullPkg = ""
  this.branch = options.branch
  stream.Transform.call(this, options)
}

util.inherits(Inform, stream.Transform)

Inform.prototype._transform = function (chunk, enc, cb) {
  this.fullPkg += chunk.toString()
  cb()
}

Inform.prototype._flush = function (err) {
  var parsed

  try {
    parsed = JSON.parse(this.fullPkg)
    parsed.sha = parsed.version
    parsed.repository.branch = this.branch
    if (parsed.repository.branch !== "staging") {
      parsed.version = hNow()
        + " "
        + "(" + parsed.sha + ")"
    }
    if( parsed.vigour ) {
    vConfig.parse(parsed.vigour
      , parsed
      , [{ 'repository.branch': 'branches' }])
    }
    this.push("window.package=" + JSON.stringify(parsed) + ";", 'utf8')
  } catch(e) {
    log.error('cannot parse json file!')
    console.log(this.fullPkg)
  }

}

exports.bundle = function (entry, opts, cb) {
  var bundleOptions = {
        cache: {}, packageCache: {}, fullPaths: true
    }
    , basedir = path.dirname(entry)
  if (!opts.branch) {
    opts.branch = '_inherit'
  }

  pkgPath = path.join(basedir, 'package.json')

  //verifyPath
  pkgPath = myUtils.findPackage( pkgPath )

  if(opts){
    bundleOptions.debug = opts.debug
    // bundleOptions.ignoreMissing = opts.ignoreMissing !== void 0 
    //   ? opts.ignoreMissing
    //   : true
    bundleOptions.noParse = opts.noParse
  }

  log.info('entry',entry)

  var b = browserify(entry,bundleOptions)
    b._callback = cb
  var transformOptions = {global:opts && opts.global || true}
  b.transform(transformOptions,handleDeps.bind(b))
  b._basedir = basedir
  b._cssdeps = {}
  b._useRootPath = true
  b._branch = opts.branch

  b.on('log',log.info)
  b.on('update',compile)
  b.on('dep',perhapsCompileCSS)
  b.on('done',function (done) {
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
      if(w._callback) {
        w._callback(null) 
      }
    }
  })

  compile.call(b)
}

var gitHead

function getGitHead (dir) {
  var optimize = false
  return new Promise(function (resolve, reject) {
    var p
    if (gitHead && optimize) {
      resolve(gitHead)
    } else {
      p = path.join(dir, '.git')
      fs.exists(p, function (exists) {
        if (exists) {
          resolve(readFile(path.join(p, 'HEAD'), 'utf8')
            .then(function (data) {
              var head = parseHEAD(data)
              gitHead = head
              return head
            }))
        } else {
          resolve(getGitHead(path.resolve(dir, '..')))
        }
      })
    }
  })
}

function parseHEAD (str) {
  var i = str.lastIndexOf('/')
  return str.slice(i + 1, str.length - 1)
}

function compile(){
  var _this = this

  _this._cssprocessing = false
  _this._depscomplete = false
  _this._compiling = true
  _this._csscomplete = true
  _this._jscomplete = false

  var branch = new Promise(function (resolve, reject) {
    if (_this._branch === '_inherit') {
      resolve(getGitHead(_this._basedir))
    } else {
      resolve(_this._branch)
    }
  })
  .catch(function (reason) {
    console.error("Can't auto detect branch", reason)
  })
  .then(function (branch) {
    var output = path.join(_this._basedir,'bundle.js')
      , pkgStream
      , bundleStream = fs.createWriteStream( output )
        .on('finish', function (err) {
          if(err) {
            _this._callback(err)
          }
          _this.emit('done','js')
        })
        .on('error', function (err) {
          log.error("buildStream error", err)
        })
      , inform = new Inform({
        branch:branch
      })

    inform.on('error', function (err) {
      log.error("inform error", err)
    })
    log.info("Using branch", branch)
    pkgStream = fs.createReadStream(pkgPath)
      .on('readable', function () {
        pkgStream.pipe( inform )
          .on('error', function (err) {
            log.error("Yar Matey", err)
          })
          .pipe( bundleStream )
          .on('error', function (err) {
            log.error("pipe error", err)
          })
      })
      .on('error', function (err) {
        log.info("Caught", err)
      })

    var bundle = _this.bundle(function (err,src) {

      console.error('what this???', src)
      if(err) {
        log.error("count 5", err)
        _this._callback(err)
      }
    })
    bundle.on('error', function (err) {
      log.error("ERROR", err)
    })
    bundle.pipe( bundleStream )
      .on('error', function (err) {
        console.error("Another pipe error", err)
      })
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
    if(w._callback) {
      w._callback(null,watchifies) 
    }
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
    , obj = { paths:[w._basedir], relativeUrls:true }

  w._csscomplete = false

  var theRootPath = w._basedir
  if (theRootPath.indexOf('/') !== theRootPath.length - 1) {
    theRootPath = theRootPath + '/'
  }
  if (w._useRootPath) {
    obj.rootpath = theRootPath
  }

  less.Parser(obj).parse(css, function (err, tree) {
    if(err) {
      w._callback(err)
    }
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
        if(err) {
          w._callback(err)
        }
        w.emit('done','css')
      })
    }
    catch (ex) {
      w._callback(ex)
    }
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