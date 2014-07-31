module.exports = exports = startServer
exports.serveFile = serveFile

var fs = require('graceful-fs')  
  , http = require('http')
  , u = require('url')
  , path = require('path')
  , log = require('npmlog')
  , _compile = require('./compile')
  , _natify = require('./natify')
  , cssAsset = fs.readFileSync(__dirname + "/cssText.css", "utf8")
  , jsAsset = fs.readFileSync(__dirname + "/jsText.js", "utf8")
  , nativeCreateDialog = fs.readFileSync(__dirname + "/nativeCreateDialog.html", "utf8")
  , gastonUrl = "/gastonReservedUrlHopefullyNobodyNamesADirectoryLikeThis"
  , cordovaDirectoryName = "nativeBuildStuff"

function startServer (port, compile, close, debug, build) {
  if(compile){
    cb = function(index, res){
      return _compile(index, res, close, debug, build)
    }
  }
  http.createServer(function (req, res) {
    var parsedUrl = u.parse(req.url, true)
      , pathname = parsedUrl.pathname
      , url = path.join(process.cwd(),pathname)
      , natifyAction
      , cordovaDirectory
      , natifyDone = function (error) {
        if (error) {
          res.end(error)
        } else {
          res.end("success")
        }
      }
    if (pathname.indexOf(gastonUrl) === 0) {
      if (parsedUrl.query.action === "build") {
        cordovaDirectory = parsedUrl.query.path + "/" + cordovaDirectoryName
        fs.exists(cordovaDirectory, function (exists) {
          if (exists) {
            _natify.build(cordovaDirectory, natifyDone)
          } else {
            res.end("pleaseCreate")
          }
        })
      } else if (parsedUrl.query.action === "create") {
        _natify.create(parsedUrl.query.path, cordovaDirectoryName, parsedUrl.query.rdsid, parsedUrl.query.displayName, natifyDone)
      }
      // else if (parsedUrl.query.action === "run") {}
      else res.end("Gaston says: You want me to do something I've never heard of. Well I don't like it. I don't like it one bit.")

      
    } else {
      fs.exists(url,function(exists){
        if(exists) found(url, pathname, res,cb)
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

function serveDirectory(url, pathname, res){
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
          , button = addBtn(file, file, pathname, contentfiles, containsIndexHtml)
        if(containsIndexHtml) buttons = button + buttons
        else buttons += button
      }
    }
    makeUI(url, buttons,res)
  })
}

function found (url, pathname, res, cb) {
  fs.stat(url,function(err,stats){
    if(err) log.error(err)
    else if(stats.isFile()) serveFile(url,res)
    else if(stats.isDirectory()) serveIndex (url,res,cb) || serveDirectory(url, pathname, res)
  })
}

function notFound (url, res) {
  log.http('Can\'t find ',url)
  if(!path.extname(url).length){
    var msg = 'Can\'t find ' + url
    var button = addBtn(msg,'', '', 'Go Back To Top')
    makeUI(url,button,res)
  } else res.end()
}

function addBtn (title, val, pathname, subtitle, containsIndexHtml){
  var label = '<h3>' + title + '</h3>'
    , directoryContents = (subtitle) ? '<p>' + subtitle + '</p>' : ''
    , targetPath = pathname.slice(1) + val
    , buildNative = (containsIndexHtml) ? '<button class="nativeButton" onclick="buildNative(\'' + targetPath + '\', \'' + gastonUrl + '\')">Build native apps</button>' : ''
  return '<button class="gotoButton" onclick="goTo(\'' + val + '/\');">'
    + label
    + directoryContents
    + '</button>'
    + buildNative
}

function makeUI (url, buttons, res) {
  var head = '<head><meta charset="utf-8"><style type="text/css">' + cssAsset + '</style><script type="text/javascript">var gastonUrl = "' + gastonUrl + '";' + jsAsset + '</script></head>'
    , urlpath = url.split(path.sep).join(' > ').slice(2, -3)
    , breadcrumbs = '<h2>' + urlpath + '</h2>'
    , ui = '<!doctype html><html>' + head + '<body>' + breadcrumbs + buttons + nativeCreateDialog + '</body></html>'
  res.end(ui)  
}