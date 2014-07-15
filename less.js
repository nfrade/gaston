var fs = require('graceful-fs')
  , path = require('path')
  , less = require('less')
  , log = require('npmlog')

var cnt = 0
  , lessString = ''

exports.compile = function (dirname) {
  less.render(lessString,function (e, css) {
    if (e) log.error('less', e)
    fs.writeFile(path.join(dirname,'bundle.css'), css, function(err){
      if (err) log.error('less write', err)
      cnt = 0
    })
  })
}

exports.requireImports = function(buf,enc,next){
  var string = buf.toString('utf8')
    , found = string.match(/@import([\s\S]*?)\((.*?)\);?/g)
  if(found){
    for (var i = found.length - 1, file; i >= 0;) {
      file = found[i--].match(/url\(("|')?(.*?)("|')?\)/)[2]
      this.push('require("' + file + '")')
    }
  }
}

exports.prepareLess = function (buf,resolve,dirname) {
  var string = buf.toString('utf8')
    , found = string.match(/("|')((?!(https?:\/\/)|(data:)).)(.*?)(\.([a-z0-9A-Z?#-_]{0,15})("|'))/g)

  if(found){
    for (var i = found.length - 1, file, resolved; i >= 0;) {
      file = found[i--].replace(/("|')/g,'')
      resolved = path.join(resolve,file)
      string = string.replace(new RegExp(file,'g'), resolved)
    }
  }

  if(!(cnt++)) lessString = ''

  string = string.replace(/@import([\s\S]*?)\((.*?)\);?/g, '')

  lessString = string + '\n' + lessString //right order?
}