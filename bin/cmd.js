var gaston = require('../')

//default sources
, rootFolder = './'
, indexFile = rootFolder + 'index.js'

//default destinations
, buildFolder = rootFolder
, jsBuildFileName = 'bundle.js'
, cssBuildFileName = 'bundle.css'

//options
, port = 8080
, livereload
, debug
, js
, less

, arg
, args = process.argv
, i = j = args.length

//check for options
while (i--) {
  arg = args[i]
  if (arg === '-port"' || arg === '-p:') port = Number(arg.slice(3))
  if (arg === '-livereload' || arg === '-lr') livereload = true
  if (arg === '-debug') debug = true
  if (arg === '-js') js = true
  if (arg === '-less' || arg === '-css') less = true
}

//default compile settings
if(!js && !less) js = less = true

//check for commands
while (j--) {
  arg = args[j]
  if (arg === 'webserver') gaston.webserver(rootFolder, port, livereload)
  if (arg === 'compile') {
    js && gaston.compileJs(indexFile, debug, jsBuildFileName, buildFolder)
    ;less && gaston.compileLess(indexFile, cssBuildFileName, buildFolder)
  }
  if (arg === 'build') gaston.build(buildFolder, jsBuildFileName, cssBuildFileName)
}