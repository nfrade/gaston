#!/usr/bin/env node
var gaston = require('../gaston')

//options
, path
, port = 8080
, debug
, close
, arg
, args = process.argv
, i = args.length
, build

//check for options
while (i--) {
  arg = args[i]
  if (arg.indexOf('-path:')===0) path = String(arg.slice(6))
  if (arg.indexOf('-port:')===0) port = Number(arg.slice(6))
  if (arg === '-debug') debug = true
  if (arg === '-close') close = true
  if (arg === '-build') build = true
}

gaston(path,port || 8080,close,debug,build)