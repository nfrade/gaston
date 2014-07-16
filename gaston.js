var fs = require('graceful-fs')
  , watchify = require('watchify')
  , through = require('through2')
  , path = require('path')
  , log = require('npmlog')
  , less = require('./less')
  , server = require('./server')

module.exports = function(p, port, close, debug){

  p = path.join(process.cwd(), p || 'index.js')
  
  var w = watchify()
    , dirname = path.dirname(p)
    , output = path.join(dirname,'bundle.js')

  w.add(p)
  w.transform({global:true},check)
  w.on('log', ready )
  w.on('update', update )

  compile()
  
  module.exports = compile

  function compile () {
    w.deps()
      .on('data',function(data){
        var deps = data.deps
        for(var i in deps){
          file = deps[i]
          if (/(\.less$)|(\.css$)/.test(file)) less.prepString(file,dirname)
        }
      })

    w.bundle({debug:debug})
    .on('error', handleError )
    .on('end', function(){ 
      less.compileString(dirname)
    })
    .pipe(fs.createWriteStream(output))
  }

  function update(msg) {
    log.info('update',msg)
    compile()
  }

  function ready(msg) {
    if(msg)log.info('ready',msg)
    if(close) w.close()
    else if(port) {
      var dir = path.relative(process.cwd(),dirname)
      server(port, dir)
      port = false
    }
  }

  function check (file) {
    if (!/(\.less$)|(\.css$)/.test(file)) return through()
    return through(handleLess)
  }

  function handleLess(buf,enc,next){
    less.requireImports.call(this,buf)
    this.push(null)
    next()
  }

  function handleError ( error ){
    error = error.toString('utf8').replace(/('|")/g,'\'')
    var script = 'function doRetry () { var xmlhttp=new XMLHttpRequest();xmlhttp.open(\'GET\',\'__retry\' + Math.random(),true);xmlhttp.send();setTimeout(function(){location.reload()},50);}'
      , html = '<script>' + script +'</script><div style=\'padding:20px;font-family: DIN Next LT Pro Light,Helvetica,Arial,sans-serif;background-color:#34cda7;\'><h1>ERROR:</h1><h2>'+ error +'</h2><button style=\'padding:40px;\'onclick=\'doRetry();\'>RETRY</button></div>'
      , str = 'document.write("' + html + '");'
    fs.writeFile( output, str, function(err){if(err)log.error(err)})
    log.error(error)
    ready()
  }

}