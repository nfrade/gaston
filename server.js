var fs = require('fs')  
  , http = require('http')
  , log = require('npmlog')

module.exports = function(port){
  var server = http.createServer(function (req, res) {
    var url = req.url.slice(1)
    fs.exists(url, function(exists) {
      if(!exists) { 
        res.end('file does not exist! ' + url)
      } else {
        var rstream = fs.createReadStream(url)
        rstream.pipe(res)
      }
    })
  })

  log.info('start server on port: ',port)

  server.listen(port)  
}
