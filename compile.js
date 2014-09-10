var fs = require('graceful-fs')
  , watchify = require('watchify')
  , through = require('through2')
  , path = require('path')
  , log = require('npmlog')
  , less = require('less')
  , _server = require('./server')
  , _build = require('./build')
  , cleanCSS = require('clean-css')
  , noparse = require('./noparse.json')
  , leaveAlone = []

module.exports = function (index, opts, callback) {
  var close = opts.close
  var debug = opts.debug
  var build = opts.build
  var nocss = opts.nocss

  if (~leaveAlone.indexOf(index)) return true
  if (!close) leaveAlone.push(index)

  var depsarr = []
    , depsobj = {}
    , dirname = path.dirname(index)
    , firstCompile = true
    , outputJS = path.join(dirname, 'bundle.js')
    , outputCSS = path.join(dirname, 'bundle.css')
    , outputHTML = path.join(dirname, 'index.html')
    , buildFile = path.join(dirname, 'build.html')
    , w = watchify(index, { noparse: noparse })

    , cssReady = true
    , jsReady
    , served

    , depscount = 0
    , serveIfReady = function () {
        if (cssReady && jsReady) {
          if(!served) callback(null)
          if (build) _build(outputHTML, outputJS, outputCSS, buildFile)
          served = true
        }
      }

  w.transform({ global: true }, transformLess)
  w.on('log', ready)
  w.on('update', compile)

  compile()

  function compile (msg) {
    jsReady = false
    served = false

    if (msg) log.info('compile msg', msg)

    if (!firstCompile && !nocss) {
      refreshDeps([], done)
    } else {
      done()
    }

    function done () {
      w.bundle({ debug: debug })
        .on('error', handleError)
        // .on('end', writeCSS)
        .pipe(fs.createWriteStream(outputJS).on('finish', function () {
          jsReady = true
          serveIfReady()
       }))
    }
  }

  function ready (msg) {
    firstCompile = false
    if (msg) log.info('ready', msg)
    if (close) w.close()
  }

  function writeCSS () {
    var string = ''
      , l = depsarr.length
      , i = 0
      , fname
      , cleaned

    for (; i < l;) {
      fname = depsarr[i++]
      string += depsobj[fname] || ''
    }
    cleaned = new cleanCSS().minify(string);
    fs.writeFile(outputCSS, cleaned, function (err) {
      if (err) log.error('cssWrite', err)
      string = ''
      cssReady = true
      serveIfReady()
    })
  }

  function refreshDeps (arr, cb) {
    w.deps()
      .on('data', function (data) {
        var deps = data.deps
          , fname
        for (dep in deps) {
          fname = deps[dep]
          if(/(\.less$)|(\.css$)/.test(fname) && !~arr.indexOf(fname)){
            cssReady = false
            arr.push(fname)
          }
        }
      })
      .on('error', handleError)
      .on('end', function () {
        depsarr = arr
        cb()
      })
  }

  function transformLess (file) {
    if (!/(\.less$)|(\.css$)/.test(file)) return through()
    if (nocss) {
      var stream = through(function () {
        this.push(null)
      })
      return stream
    } else {
      cssReady = false
      var stream = through(function () { this.push(null) })
      // log.info('reading file', file)
      fs.readFile(file, 'utf8', lessParser)
      return stream
    }
    

    function lessParser (err, data) {
      var relativeUrl = path.relative(dirname, path.dirname(file))
      
      if (relativeUrl.length) relativeUrl += '/'
      depsarr.push(file)
      depscount++

      less.Parser({
        filename: file
        , relativeUrls: true
      }).parse(data, function (err, tree) {
        // log.info('parsing file', file)
        if (err) log.error('lessParse', err)
        else parseRules(tree.rules)
        // inspectTree(tree)
        try { depsobj[file] = tree.toCSS()}
        catch (ex) { log.error('toCSS',ex) }
        if(!--depscount) writeCSS()
      })

      // function inspectTree (value, parent, grandParent) {
      //   if (value instanceof Array) {
      //     value.forEach(function (v) {
      //       inspectTree(v, value, parent)
      //     })
      //   } else if (value.value) {
      //     inspectTree(value.value, value, parent)
      //   } else if (value.rules) {
      //     inspectTree(value.rules, value, parent)
      //   } else if (typeof value === "string" && value === "mtv_play_logo.png") {
      //     log.info('>>>>>', value)
      //     log.info('grandParent', grandParent)
      //   }
      // }

      function parseRules (rule) {
        if (rule instanceof Array) {
          rule.forEach(function (r) {
            parseRules(r)
          })
        } else {
          importfile = rule.importedFilename

          if (importfile) {
            stream.emit('file', importfile)
            depsarr.push(importfile)
          }

          if (rule.root) {
            parseRules(rule.root.rules)
          } else if (rule.rules) {
            parseRules(rule.rules)
          } else if (rule.value) {
            parseRules(rule.value)
          } else if (rule.currentFileInfo
              && !rule.currentFileInfo.alreadyManuallyRebased) {
            rule.currentFileInfo.alreadyManuallyRebased = true
            if (relativeUrl.length || rule.currentFileInfo.rootpath.length) {
              rule.currentFileInfo.rootpath = path.join(relativeUrl, rule.currentFileInfo.rootpath)
            }
          }
        }
      }
    }
  }

  function handleError (error) {
    log.error(error)
    error = error.toString('utf8').replace(/('|")/g,'\'')
    var script = 'function doRetry () {location.reload();}'
      , html = '<script>' + script +'</script><div style=\'padding:20px;font-family: DIN Next LT Pro Light,Helvetica,Arial,sans-serif;background-color:#34cda7;\'><h1>ERROR:</h1><h2>'+ error +'</h2><button style=\'padding:40px;\'onclick=\'doRetry();\'>RETRY</button></div>'
      , str = 'document.write("' + html + '");'
    fs.writeFile(outputJS, str, function (err) { if (err) log.error(err) })
    ready()
  }
}