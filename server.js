var fs = require('graceful-fs')  
  , http = require('http')
  , log = require('npmlog')

  , reader = function(url, res, cnt) {
      fs.exists(url, function(exists) {
        if(!exists) { 
          if(!cnt) {
            reader(url+'/',res, (cnt=true) )
          } else {
            console.log('ERROR cannot file', url)
            res.end('file does not exist! ' + url)
          }
        } else {
          fs.stat(url,function(err,stats) {
            if(stats.isDirectory()) {
              if(url[0]==='/') url = url.slice(1)
              reader(url+'index.html',res)
            } else {
              var rstream = fs.createReadStream(url)
              rstream.pipe(res)
            }
          })
        }
      })
    }

  , server = http.createServer(function (req, res) {
      reader(req.url.slice(1),res)
    })

module.exports = function(port){
  log.info('start server on port: ',port)
  server.listen(port)  
}
