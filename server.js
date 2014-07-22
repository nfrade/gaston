module.exports = exports = startServer
exports.serveFile = serveFile

var fs = require('graceful-fs')  
  , http = require('http')
  , u = require('url')
  , path = require('path')
  , log = require('npmlog')
  , _compile = require('./compile')

function startServer(port, compile, close, debug, build){
  if(compile){
    cb = function(index, res){
      return _compile(index, res, close, debug, build)
    }
  }
  http.createServer(function (req, res) {
    var url = path.join(process.cwd(),u.parse(req.url).pathname)
    fs.exists(url,function(exists){
      if(exists) found(url,res,cb)
      else notFound(url,res)
    })   
  }).listen(port)
  log.http('Start server on port: ', port)
}

function serveFile(url, res){
  var stream = fs.createReadStream(url)
    .on('open',function(){
      stream.pipe(res)
    })
    .on('finish',function(){
      res.end()
    })
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
          , button = addBtn(file,file,contentfiles)
        if(~contentarr.indexOf('index.html')) buttons = button + buttons
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

function addBtn (title,val,subtitle,highlight){
  var btnOpen = '<button style=\'padding:10px;width:100%;text-align:left;\'onclick="gotoFn(\''
    , btnClose = '</button>'
  return btnOpen
    + val 
    + '/\')";><h2>' 
    + title
    + '</h2>'
    + '<p>' 
    + subtitle || ''
    + '</p>'
    + btnClose
}

function makeUI (url,buttons,res) {
  var urlpath = url.split(path.sep).join(' > ').slice(2,-3)
  var head = '<head><h3 style=\'background-color:#34cda7;\'>' + urlpath + '</h3></head>'
  var gotoFn = 'function gotoFn(val){location.href = val}'
    , ui = '<!doctype html><body style=\'padding:20px;font-family: DIN Next LT Pro Light,Helvetica,Arial,sans-serif;\'>' + head + buttons + '</body><script>' + gotoFn + '</script></html>'
  res.end(ui)  
}