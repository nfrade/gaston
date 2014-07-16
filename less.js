var fs = require('graceful-fs')
  , path = require('path')
  , less = require('less')
  , log = require('npmlog')

  , lessString = ''
  , checked = []

exports.compileString = function (dirname) {
  less.render(lessString,function (e, css) {
    if (e) log.error('less', e)
    fs.writeFile(path.join(dirname,'bundle.css'), css, function(err){
      if (err) log.error('less write', err)
      lessString = ''
      checked = []
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

exports.prepString = function (file,dirname) {
  if(!~checked.indexOf(file)){
    
    var resolve = path.relative(dirname,path.dirname(file))

    fs.createReadStream(file)
      .on('data',function(buf){
      var string = buf.toString('utf8').replace(/@import([\s\S]*?)\((.*?)\);?/g, '')
        , found = string.match(/("|')((?!(https?:\/\/)|(data:)).)(.*?)(\.([a-z0-9A-Z?#-_]{0,15})("|'))/g)
      
      if(found){
        for (var i = found.length - 1, file, resolved; i >= 0;) {
          file = found[i--].replace(/("|')/g,'')
          resolved = path.join(resolve,file)
          string = string.replace(new RegExp(file,'g'), resolved)
        }
      }

      lessString += string + '\n' //right order?
      checked.push(file)
      
    })
  }
}