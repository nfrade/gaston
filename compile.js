var fs = require('graceful-fs')
  , watchify = require('watchify')
  , through = require('through2')
  , path = require('path')
  , log = require('npmlog')
  , less = require('less')
  , _server = require('./server')
  , _build = require('./build')

  , leaveAlone = []

module.exports = function(index, res, debug, close, build){
  
  if(~leaveAlone.indexOf(index)) return true

  var depsarr = []
    , depsobj = {}
    , dirname = path.dirname(index)
    , firstCompile = true
    , outputJS = path.join(dirname,'bundle.js')
    , outputCSS = path.join(dirname,'bundle.css')
    , outputHTML = path.join(dirname,'index.html')
    , buildFile = path.join(dirname,'build.html')
    , w = watchify(index)

    , cssReady
    , jsReady

  w.transform({global:true},transformLess)
  w.on('log', ready)
  w.on('update', compile)

  compile()

  function compile (msg) {
    jsReady = false
    cssReady = false

    if(msg) log.info(msg)
    if(!firstCompile) refreshDeps([])

    w.bundle({debug:debug})
    .on('error', handleError)
    .on('end',writeCSS)
    .pipe(fs.createWriteStream(outputJS).on('finish',function(){
      jsReady = true
      if(cssReady){
        _server.serveFile(outputHTML,res)
        if(build) _build(outputHTML, outputJS,outputCSS, buildFile)
      }
    }))
  }

  function ready(msg) {
    firstCompile = false
    if(msg) log.info('ready',msg)
    if(close) w.close()
    else leaveAlone.push(index)
  }

  function writeCSS () {
    var string = ''
      , l = depsarr.length
      , i = 0
      , fname

    for (; i < l;) {
      fname = depsarr[i++]
      string += depsobj[fname] || ''
    }

    fs.writeFile(outputCSS, string, function(err){
      if(err) log.error('cssWrite',err)
      string = ''
      cssReady = true
      if(jsReady) {
        _server.serveFile(outputHTML,res)
        if(build) _build(outputHTML, outputJS,outputCSS, buildFile)
      }
    })
  }

  function refreshDeps(arr) {
    w.deps()
    .on('data',function(data){
      var deps = data.deps
        , fname
        , l = depsarr.length
        , i = 0
      for (; i < l;) {
        fname = depsarr[i++]
        if(/(\.less$)|(\.css$)/.test(fname) && !~arr.indexOf(fname)) arr.push(fname)
      }
    })
    .on('error',handleError)
    .on('end',function(){
      depsarr = arr
    })
  }

  function addDep (filename, content){
    if(content) depsobj[filename] = content
    if(!~depsarr.indexOf(filename)) return depsarr.push(filename)
  }

  function transformLess (file) {
    if (!/(\.less$)|(\.css$)/.test(file)) return through()
    return through(lessParser)

    function lessParser(buf,enc,next){
      var that = this
        , relativeUrl = path.relative(dirname,path.dirname(file))

      if(relativeUrl.length) relativeUrl += '/'

      addDep(file)
      less.Parser({ filename:file }).parse(buf.toString(),parseLess)
      
      function parseLess(err, tree){
        if (err) return next() || log.error('lessParse',err)
        parseRules(tree.rules)
        var css
        try {
          css = tree.toCSS()
        }catch (ex) {
          log.error(ex)
        }
        addDep(file,css)
        next()
      }

      function parseRules (rules) {
        for (var l = rules.length, i = 0, rule, importpath, importfile; i < l; i++) {
          rule = rules[i]
          importpath = rule.path
          if(importpath){
            importfile = path.resolve(importpath.currentFileInfo.entryPath,importpath.value.value)
            addDep(importfile) && that.push('require("' + importfile + '")')
          }
          if(rule.currentFileInfo) rule.currentFileInfo.rootpath = relativeUrl
          if(rule.rules) parseRules(rule.rules)
        }
      }
    }
  }

  function handleError ( error ){
    log.error(error)
    error = error.toString('utf8').replace(/('|")/g,'\'')
    var script = 'function doRetry () {location.reload();}'
      , html = '<script>' + script +'</script><div style=\'padding:20px;font-family: DIN Next LT Pro Light,Helvetica,Arial,sans-serif;background-color:#34cda7;\'><h1>ERROR:</h1><h2>'+ error +'</h2><button style=\'padding:40px;\'onclick=\'doRetry();\'>RETRY</button></div>'
      , str = 'document.write("' + html + '");'
    fs.writeFile( outputJS, str, function(err){if(err)log.error(err)})
    ready()
  }
}