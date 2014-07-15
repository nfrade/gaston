var fs = require('graceful-fs')  
  , http = require('http')
  , path = require('path')
  , log = require('npmlog')

module.exports = function(port,dir){
  
  var reader = function(url, res, cnt) {
        
      fs.exists(url, function(exists) {
        if(!exists) { 
          if(!cnt) {
            reader(url,res, (cnt=true) )
          } else {
            var urlpath = path.join(process.cwd(),url)
            log.error('cannot find file', urlpath)
            res.end('file does not exist! ' + urlpath)
          }
        } else {
          fs.stat(url,function(err,stats) {
            if(stats.isDirectory()) {
              if(url[0]==='/') url = url.slice(1)
              reader(path.join(url,'index.html'),res)
            } else {
              var rstream = fs.createReadStream(url)
              rstream.pipe(res)
            }
          })
        }
      })
    }

  , server = http.createServer(function (req, res) {
      if(~req.url.indexOf('__retry')) {
        log.info('retry')
        require('./gaston')()
      }else reader(path.join(dir,req.url.slice(1)),res)
    })

  log.info('start server on port: ',port)
  server.listen(port)  
}
