var fs = require('graceful-fs')
	, http = require('http')
	, log = require('npmlog')
	, u = require('url')
	, p = require('path')
	, natify = require('./natify')
  , compiler = require('./compile')
  , util = require('./util')
  , mime = require('mime')

module.exports = exports = Server

function Server (opts) {
	var self = this
	this.port = opts.port
  this.cssAsset = fs.readFileSync(__dirname + '/cssText.css', 'utf8')
  this.jsAsset = fs.readFileSync(__dirname + '/jsText.js', 'utf8')
  this.dialogs = fs.readFileSync(__dirname + '/dialogs.html', 'utf8')
  this.compilerOpts = opts
	this.server = http.createServer(function (req, res) {
		var parsedUrl = u.parse(req.url, true)
			, pathname = parsedUrl.pathname
		// if (pathname.indexOf(self.commandUrl) === 0) {
		// 	self.parseCommand(parsedUrl.query, res)
		// } else {
			self.serve(p.join(process.cwd(), parsedUrl.pathname), res)
		// }
	})
}

Server.prototype.bundle = compiler

Server.prototype.commandUrl = '/gastonReservedUrlHopefullyNobodyNamesADirectoryLikeThis'

Server.prototype.start = function () {
	this.listener = this.server.listen(this.port)
  log.http("Gaston is at your service at http://localhost:" + this.port)
}

Server.prototype.serve = function (path, res) {
  var self = this
  fs.exists(path, function (exists) {
    if (exists) {
      fs.stat(path, function (err, stats) {
        if (err) {
          log.error('fs.stats err', err)
          res.end(self.stringify(err))
        } else if (stats.isFile()) {
          self.serveFile(path, res)
        } else if (stats.isDirectory()) {
          self.serveDirectory(path, res)
        }
      })
    } else {
      var msg = "Can't find " + path
      log.http(msg, path)
      if (!p.extname(path).length) {
        res.end(self.makeUI(path, self.button(msg
          , ''
          , ''
          , "Go Back To Top")
        ))
      } else {
        res.end()
      }
    }
  })
}


Server.prototype.serveFile = function (path, res) {
  var self = this
  res.writeHead(200, {'Content-Type': mime.lookup(path) });
  var stream = fs.createReadStream(path)
    .on('open', function () {
      stream.pipe(res)
    })
    .on('finish', function () {
      res.end()
    })
    .on('error',function (err){
      err.details = "Error event fired from read stream"
      log.error('read stream error', err)
      res.end(self.stringify(err))
    })
}

Server.prototype.serveDirectory = function (path, res) {
  var self = this
    , index = p.join(path, 'index.html')
  fs.exists(index, function (exists) {
    if (exists) {
      self.serveIndex(path, index, res)
    } else {
      self.serveDirectoryListing(path, res)
    }
  })
}

Server.prototype.serveIndex = function (dir, index, res) {
  var self = this
    , indexjs = p.join(dir, 'index.js')
  fs.exists(indexjs, function (exists) {
    if (exists) {
      self.bundle(indexjs, self.compilerOpts, function (err, watchifies) {
        if (err) {
          err.stream = null
          err.stack = null
          log.error('bundle error', err)
          res.end(err.toString())
        } else {
          self.serveFile(index, res)
        }
      })
    } else {
      self.serveFile(index, res)
    }
  })
}

Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {}

        Object.getOwnPropertyNames(this).forEach(function (key) {
            alt[key] = this[key]
        }, this)

        return alt
    },
    configurable: true
})

Server.prototype.stringify = function (val) {
  var str
  try {
    str = JSON.stringify(val, null, " ")
  } catch (e) {
    str = "Un stringifyable error (" + e.toString() + "). Check gaston logs."
  }
  return str
}

Server.prototype.serveDirectoryListing = function (dir, res) {
  var self = this
  fs.readdir(dir, function (err, files) {
    if (err) {
      log.error('fs.readdir error', err)
      res.end(self.stringify(err))
    } else {
      var havingIndex = []
        , lackingIndex = []
      util.asyncEach(files
        , function (file, cb) {
          var path = p.join(dir, file)
          fs.stat(path, function (err, stats) {
            if (err) {
              err.details = "Error in fs.stats"
              cb(err)
            } else {
              if (stats.isDirectory()) {
                fs.readdir(path, function (err, entries) {
                  if (err) {
                    err.details = "Error in readdir"
                    cb(err)
                  } else {
                    var containsIndex = ~entries.indexOf('index.html')
                      , btn = self.button(file, file, dir, entries.join(' | '), containsIndex)
                    if (containsIndex) {
                      havingIndex.push(btn)
                    } else {
                      lackingIndex.push(btn)
                    }
                    cb(null)
                  }
                })
              } else {
                cb(null)
              }
            }
          })
        }
        , function (err) {
          if (err) {
            log.error('directory listing ui creation errors', err)
            res.end(self.stringify(err))
          } else {
            res.end(self.makeUI(dir, havingIndex.concat(lackingIndex).join('')))  
          }
        })
      }
    })
}

Server.prototype.button = function (title, val, pathname, subtitle, containsIndex) {
  var label = '<h3>' + title + '</h3>'
    , directoryContents = (subtitle) ? '<p>' + subtitle + '</p>' : ''
    , targetPath = pathname.slice(1) + val
    , className = "gotoButton"
    , enableNative = ''//(containsIndex) ? '<button class="natify">Run natively<input type="hidden" class="natifyTargetPath" value="' + targetPath + '"></button>' : ''
  if (containsIndex) {
    className += " containsIndex"
  }
  return '<button class="' + className + '" onclick="goTo(\'' + val + '/\');">'
    + label
    + directoryContents
    + '</button>'
    + enableNative
}

Server.prototype.makeUI = function (url, buttons) {
  var head = '<head><meta charset="utf-8"><style type="text/css">' + this.cssAsset + '</style><script type="text/javascript">' + this.jsAsset + '</script></head>'
    , urlpath = url.split(p.sep).join(' > ').slice(3, -3)
    , breadcrumbs = '<h2>' + urlpath + '</h2>'
    , data = '<input id="gastonUrl" type="hidden" value="' + this.commandUrl + '">'
    , ui = '<!doctype html><html>' + head + '<body>' + data + breadcrumbs + buttons + this.dialogs + '</body></html>'
  return ui
}

// Server.prototype.parseCommand = function (query, res) {
// 	var done = function (error, data) {
//       if (error) {
//         res.end(JSON.stringify({
//           msg: 'failure'
//           , error: error.toString()
//         }))
//       } else {
//         res.end(JSON.stringify({
//           msg: 'success'
//           , content: data
//         }))
//       }
//     }
//     , cordovaDirectoryName = 'nativeBuildStuff'
//     , cordovaDirectory = query.path + '/' + cordovaDirectoryName
//   if (query.action === 'enable') {
//     natify.isCreated(query.path
//       , cordovaDirectoryName
//       , done)
//   } else if (query.action === 'create') {
//     natify.create(query.path
//       , cordovaDirectoryName
//       , query.rdsid
//       , query.displayName
//       , done)
//   } else if (query.action === 'getConfig') {
//     natify.getConfig(query.path
//       , cordovaDirectoryName
//       , done)
//   } else if (query.action === 'saveConfig') {
//     natify.saveConfig(query.path
//       , cordovaDirectoryName
//       , query.data
//       , done)
//   } else if (query.action === 'getPlatforms') {
//     natify.getPlatforms(query.path
//       , cordovaDirectoryName
//       , done)
//   } else if (query.action === 'emulate') {
//     natify.preparePlatforms(query.path
//       , cordovaDirectoryName
//       , JSON.parse(query.platforms)
//       , '--emulator'
//       , done)
//   } else if (query.action === 'run') {
//     natify.preparePlatforms(query.path
//       , cordovaDirectoryName
//       , JSON.parse(query.platforms)
//       , '--device'
//       , done)
//   } else if (query.action === 'launch') {
//     natify.run(query.path
//       , cordovaDirectoryName
//       , JSON.parse(query.targets)
//       , query.ultimateAction
//       , done)
//   }
//   else res.end("Gaston says: You want me to do something I've never heard of. Well I don't like it. I don't like it one bit.")
// }
