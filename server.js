module.exports = exports = startServer
exports.serveFile = serveFile

var fs = require('graceful-fs')  
  , http = require('http')
  , u = require('url')
  , path = require('path')
  , log = require('npmlog')
  , _compile = require('./compile')
  , cssAsset = fs.readFileSync(__dirname + "/cssText.css", "utf8")
  , jsAsset = fs.readFileSync(__dirname + "/jsText.js", "utf8")
  , gastonUrl = "/gastonReservedUrlHopefullyNobodyNamesADirectoryLikeThis"

function startServer (port, compile, close, debug, build, buildNative) {
  if(compile){
    cb = function(index, res){
      return _compile(index, res, close, debug, build)
    }
  }
  http.createServer(function (req, res) {
    var pathname = u.parse(req.url).pathname
      url = path.join(process.cwd(),pathname)
    if (pathname === gastonUrl) {
      res.end("Upcoming feature, stay tuned")
    } else {
      fs.exists(url,function(exists){
        if(exists) found(url,res,cb)
        else notFound(url,res)
      })
    }
  }).listen(port)
  log.http('Start server on port: ', port)
}

function serveFile(url, res){
  var stream = fs.createReadStream(url)
    .on('open',function(){ stream.pipe(res) })
    .on('finish',function(){ res.end() })
    .on('error',function(err){ 
      res.end()
      log.error(err) 
    })
}

function serveIndex (url,res,cb) {
  var index = path.join(url,'index.html')
    , exists = fs.existsSync(index)
  
  if(exists) checkIndexJS(url,res,cb) && serveFile(index, res)
  return exists
}

function checkIndexJS (url,res,cb) {
  var index = path.join(url,'index.js')
    , exists = fs.existsSync(index)

  if(exists && cb) return cb(index, res)
  else return true
}

function serveDirectory(url, res){
  fs.readdir(url, function(err,files){
    if(err) log.error(err)
    var buttons = ''
      , content = ''
      , stats
    for (var i = files.length - 1; i >= 0;) {
      var file = files[i--]
        , filepath = path.join(url,file)
        , isDirectory = fs.statSync(filepath).isDirectory()
      if(isDirectory && !(file.indexOf('.')===0)) {
        var contentarr = fs.readdirSync(filepath)
          , contentfiles = contentarr.join(' | ')
          , containsIndexHtml = ~contentarr.indexOf('index.html')
          , button = addBtn(file, file, contentfiles, containsIndexHtml)
        if(containsIndexHtml) buttons = button + buttons
        else buttons += button
      }
    }
    makeUI(url,buttons,res)
  })
}

function found (url, res, cb) {
  fs.stat(url,function(err,stats){
    if(err) log.error(err)
    else if(stats.isFile()) serveFile(url,res)
    else if(stats.isDirectory()) serveIndex (url,res,cb) || serveDirectory(url, res)
  })
}

function notFound (url, res) {
  log.http('Can\'t find ',url)
  if(!path.extname(url).length){
    var msg = 'Can\'t find ' + url
    var button = addBtn(msg,'','Go Back To Top')
    makeUI(url,button,res)
  } else res.end()
}

function addBtn (title, val, subtitle, containsIndexHtml){
  var label = '<h3>' + title + '</h3>'
    , directoryContents = (subtitle) ? '<p>' + subtitle + '</p>' : ''
    , buildNative = (containsIndexHtml) ? '<button class="buildNative" onclick="buildNative(\'' + val + '\', \'' + gastonUrl + '\')">Build native apps</button>' : ''
  return '<button class="goto" onclick="goTo(\'' + val + '/\');">'
    + label
    + directoryContents
    + '</button>'
    + buildNative
}

function makeUI (url,buttons,res) {
  var head = '<head><meta charset="utf-8"><style type="text/css">' + cssAsset + '</style><script type="text/javascript">' + jsAsset + '</script></head>'
    , urlpath = url.split(path.sep).join(' > ').slice(2, -3)
    , breadcrumbs = '<h2>' + urlpath + '</h2>'
    , ui = '<!doctype html><html>' + head + '<body>' + breadcrumbs + buttons + '</body></html>'
  res.end(ui)  
}