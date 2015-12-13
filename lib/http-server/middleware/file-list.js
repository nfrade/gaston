'use strict'

var fs = require('vigour-fs-promised')
var path = require('path')
var url = require('url')

module.exports = function(req, res, next){
  var Config = global.Config
  var parsedUrl = url.parse(req.url, true)
  var query = parsedUrl.query
  if (query.$action !== 'file-list') {
    return next()
  }

  var fullPath = path.join(Config.gaston['base-path'], parsedUrl.pathname)
  fs.existsAsync(fullPath)
    .then((exists) => {
      if(!exists){
        return res.status(404).send('file/directory not found')
      }
      return fs.statAsync(fullPath)
        .then((stat) => {
          if(!stat.isDirectory()){
            return res.status(400).send('Bad Request')
          }
          getFiles(fullPath)
            .then((files) => res.status(200).json(files))
        })
    })
}

var getFiles = function(fullPath){
  var fileList
  return fs.readdirAsync(fullPath)
    .then((files) => files.filter((file) => file.indexOf('.') !== 0))
    .then((files) => {
      fileList = files
      var promises = []
      for(let i = 0, l = files.length; i < l; i++){
        let file = files[i]
        promises.push(fs.statAsync(path.join(fullPath, file)))
      }
      return Promise.all(promises)
    })
    .then((stats) => {
      let parsedFiles = []
      for(let i = 0, l = fileList.length; i < l; i++){
        let file = fileList[i]
        let stat = stats[i]
        parsedFiles.push({
          name: file,
          size: stat.size,
          isDir: stat.isDirectory(),
          created: stat.ctime,
          modified: stat.mtime
        })
      }
      return parsedFiles
    })
}