var fs = require('graceful-fs')
  , path = require('path')
  , less = require('less')
  , log = require('npmlog')

  , lessString = ''
  , checked = []
  , ready
  , cnt = 0

exports.go = function () {
  ready = true
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

exports.prepString = function (file,dirname) {
  if(!~checked.indexOf(file)){
    checked.push(file)

    var resolve = path.relative(dirname,path.dirname(file))

    fs.readFile(file,'utf8',function(err,string){
      if(err) log.error(err)

      var found = string
          .replace(/@import([\s\S]*?)\((.*?)\);?/g, '')
          .match(/("|')((?!(https?:\/\/)|(data:)).)(.*?)(\.([a-z0-9A-Z?#-_]{0,15})("|'))/g)
      
      if(found){
        for (var i = found.length - 1, file, resolved; i >= 0;) {
          file = found[i--].replace(/("|')/g,'')
          resolved = path.join(resolve,file)
          string = string.replace(new RegExp(file,'g'), resolved)
        }
      }

      lessString += string + '\n'

      cnt++

      if(ready && checked.length === cnt){
        less.render(lessString,function (e, css) {
          if (e) log.error('less', e)
          fs.writeFile(path.join(dirname,'bundle.css'), css, function(err){
            if (err) log.error('less write', err)
            lessString = ''
            checked = []
          })
        })
      }

    })
  }
}