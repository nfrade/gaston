"use strict";

var fs = require('vigour-fs-promised')
var path = require('path')

module.exports = function copyDependencies (deps, target) {
  var total = 0

  return new Promise(function (resolve, reject) {
    var onStreamClosed = function onStreamClosed () {
      if (++total === deps.length) {
        resolve()
      }
    }

    for (let i = 0, l = deps.length; i < l; i++) {
      let source = path.join(__dirname, '../../..', (deps[i]))
      let fileName = deps[i].split(path.sep).pop()
      let copyTo = path.join(target, fileName)
      let rs = fs.createReadStream(source)
      let ws = fs.createWriteStream(copyTo)
      rs.on('close', onStreamClosed)
      rs.pipe(ws)
    }
  })
}
