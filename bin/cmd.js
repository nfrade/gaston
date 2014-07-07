#!/usr/bin/env node
var gaston = require('../')

//default files
, htmlFile = 'index.html'
, jsFile = 'index.js'
, cssFile = 'style.css'

//default destinations
, buildFolder = ''
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
  if (arg.indexOf('-p:')===0) port = Number(arg.slice(3))
  if (arg === '-livereload' || arg === '-lr') livereload = true
  if (arg === '-debug') debug = true
  if (arg === '-js') js = true
  if (arg === '-less' || arg === '-css') less = true
  if (arg.indexOf('-root:')===0) buildFolder ='act' + '/'
}

//default compile settings
if(!js && !less) js = less = true
//check for commands
while (j--) {
  arg = args[j]
  if (arg === 'prepare')
    gaston.prepare(buildFolder)
  if (arg === 'compile') {
    if(js && less){
      gaston.prepare(buildFolder,function (){
        gaston.compileJs(jsFile, debug, jsBuildFileName, buildFolder)
        gaston.compileLess(jsFile, cssBuildFileName, buildFolder) 
      })
    }else{
      js && gaston.compileJs(jsFile, debug, jsBuildFileName, buildFolder)
      ;less && gaston.compileLess(jsFile, cssBuildFileName, buildFolder)     
    }
  }
  if (arg === 'build')
    gaston.build(buildFolder, jsBuildFileName, cssBuildFileName)
  if (arg === 'webserver')
    gaston.webserver(buildFolder, port, livereload)
}