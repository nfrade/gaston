#!/usr/bin/env node
var gaston = require('./gaston')
	//options
	, port = 8080
	, debug
	, close
	, build
	, nocss

	, arg
	, args = process.argv
	, i = args.length


//check for options
while (i--) {
  arg = args[i]
  if (arg.indexOf('-port:')===0) port = Number(arg.slice(6))
  if (arg === '-debug') debug = true
  if (arg === '-close') close = true
  if (arg === '-build') build = true
  if (arg === '-nocss') nocss = true
}

gaston(port || 8080,close,debug,build,nocss)