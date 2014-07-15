var fs = require('graceful-fs')
  , path = require('path')
  , less = require('less')

module.exports = function (lessFiles, dirname){
  if(lessFiles.length) {  
    var string = filesToString(lessFiles,dirname)
    less.render(string,function (e, css) {  // compile less to css
      if (e) log.error('compile-less less render', e)
      fs.writeFile('bundle.css', css, function(err){
        if (err) log.error('compile-less write file', err)
      })
    })
  }
}

function filesToString (files,dirname) {
  var string = ''
    , str
    , i = files.length - 1
    , file
    , cnt = 0
  for (; i >= 0;) {
    cnt++
    file = path.normalize(files[i--])
    str = fs.readFileSync(file, 'utf8').replace(/@import([\s\S]*?)\((.*?)\);?/g, '')
    string += rebasePaths(str, path.dirname(file),dirname)
  }
  return string
}

function rebasePaths (string, nested, dirname) {
  var found = string.match(/url\(([^@])("|')?(.*?)("|')?\)/g)
    , from
    , to
    , i = (found||[]).length - 1
    , from = path.relative(dirname, nested)
    , replace

  for (; i >= 0;) {
    to = found[i--].match(/\(("|')?(.*?)("|')?\)/)[2]

    if(!(to.indexOf('data:') === 0 || /^https?:\/\//.test(to))){ // check if this is a file
      replace = path.join(from, to)
      string = string.replace(to, replace)
    }
  }
  return string
}