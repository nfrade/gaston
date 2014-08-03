var fs = require('graceful-fs')
  , watchify = require('watchify')
  , through = require('through2')
  , path = require('path')
  , log = require('npmlog')
  , less = require('less')
  , _server = require('./server')
  , _build = require('./build')
  , cleanCSS = require('clean-css')

  , leaveAlone = []

module.exports = function (index, res, close, debug, build) {
  
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
    , w = watchify(index)

    , cssReady
    , jsReady
    , served

    , depscount = 0
    , serveIfReady = function () {
        if (cssReady && jsReady) {
          if(!served) _server.serveFile(outputHTML,res)
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
    cssReady = false
    served = false

    if (msg) log.info('compile msg', msg)
    if (!firstCompile) refreshDeps([])

    w.bundle({ debug: debug })
    .on('error', handleError)
    // .on('end', writeCSS)
    .pipe(fs.createWriteStream(outputJS).on('finish', function () {
      jsReady = true
      serveIfReady()
    }))
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

  function refreshDeps (arr) {
    w.deps()
    .on('data', function (data) {
      var deps = data.deps
        , fname
        , l = depsarr.length
        , i = 0
      for (; i < l;) {
        fname = depsarr[i++]
        if(/(\.less$)|(\.css$)/.test(fname) && !~arr.indexOf(fname)) arr.push(fname)
      }
    })
    .on('error', handleError)
    .on('end', function () {depsarr = arr})
  }

  function transformLess (file) {
    if (!/(\.less$)|(\.css$)/.test(file)) return through()
    var stream = through(function () { this.push(null) })
    fs.readFile(file, 'utf8', lessParser)
    return stream

    function lessParser (err, data) {
      var relativeUrl = path.relative(dirname, path.dirname(file))
      // log.info('file', file)
      // log.info('data', data)
      // log.info('\n')
      
      if (relativeUrl.length) relativeUrl += '/'
      depsarr.push(file)
      depscount++

      less.Parser({
        filename: file
        , relativeUrls: true
      }).parse(data, function (err, tree) {
        // log.info('parsing file', file)
        // log.info('tree', JSON.stringify(tree, null, "  "))
        if (err) log.error('lessParse', err)
        else parseRules(tree.rules)
        // log.info('tree', JSON.stringify(tree, null, "  "))
        try { depsobj[file] = tree.toCSS()}
        catch (ex) { log.error(ex) }
        if(!--depscount) writeCSS()
      })

      function parseRules (rules) {
        if(!(rules instanceof Array)) rules = [rules]
        rules.forEach(function (rule) {
          importfile = rule.importedFilename

          // if (rule.value) console.log(JSON.stringify(rule.value))
          if (importfile) {
            stream.emit('file', importfile)
          }
          if (rule.name) {
            // log.info('rule name', rule.name)
            // log.info('rule', JSON.stringify(rule, null, "  "))
          }
          if (rule.root) {
            // log.info('recursion (root)')
            parseRules(rule.root.rules)
          //} else if (rule.rules) {
            // log.info('recursion (rules)')
            // parseRules(rule.rules)
          } else if (rule.currentFileInfo && (relativeUrl.length || rule.currentFileInfo.rootpath.length)){
              rule.currentFileInfo.rootpath = path.join(relativeUrl, rule.currentFileInfo.rootpath)
          }
          // else if (rule.value) parseRules(rule.value)
          // THIS WORKS FOR MTV PERFECTLY => DOESNT FOR TEST CASE (turn off relativeUrls and change rootPath to relativeUrl instead of path.join etc => works perfect)
        })
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