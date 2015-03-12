#!/usr/bin/env node
var fs = require('fs')
	, path = require('path')
	, readline = require('readline')
	, proc = require('child_process')
  , log = require('npmlog')
	, Promise = require('promise')
	, uglifyjs = require('uglify-js')
	, CleanCSS = require('clean-css')
	, compile = require('./compile')
	, root = process.cwd()
	, jsIn = path.join(root, 'index.js')
	, jsOut = path.join(root, 'build.js')
	, cssIn = path.join(root, 'bundle.css')
	, cssOut = path.join(root, 'build.css')
	, htmlIn = path.join(root, 'index.html')
	, htmlOut = path.join(root, 'build.html')
	, pkg = path.join(root, 'package.json')
	, rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	})
	, readFile = Promise.denodeify(fs.readFile)
	, writeFile = Promise.denodeify(fs.writeFile)
	, appendFile = Promise.denodeify(fs.appendFile)

inReady()
	.then(outReady)
	.then(bundle)
	.then(uglify)
	.then(save)
	.then(stamp)
	.then(minify)
	.then(build)
	.then(bumpVersion)
	.then(end)
	.catch(function (reason) {
		console.error("FAIL", reason)
		end()
	})

function inReady () {
	return Promise.all([jsIn, cssIn, htmlIn].map(function (file) {
		return new Promise(function (resolve, reject) {
			fs.exists(file, function (exists) {
				if (exists) {
					resolve(file)
				} else {
					reject("Can't find " + file)
				}
			})
		})
	}))
}

function outReady () {
	return new Promise(function (resolve, reject) {
		fs.exists(jsOut, function (exists) {
			if (exists) {
				rl.question(jsOut + " already exists. Replace? [Y/n]"
					, function (answer) {
					answer = answer.toLowerCase()
					if (answer === 'y'
						|| answer === ''
						|| answer === 'yes') {
						next()
					} else {
						reject("Operation canceled")
					}
				})
			} else {
				next()
			}
		})

		function next () {
			fs.exists(cssOut, function (exists) {
				if (exists) {
					rl.question(cssOut + " already exists. Replace? [Y/n]"
						, function (answer) {
						answer = answer.toLowerCase()
						if (answer === 'y'
							|| answer === ''
							|| answer === 'yes') {
							after()
						} else {
							reject("Operation canceled")
						}
					})
				} else {
					after()
				}
			})
		}

		function after () {
			fs.exists(htmlOut, function (exists) {
				if (exists) {
					rl.question(htmlOut + " already exists. Replace? [Y/n]"
						, function (answer) {
						answer = answer.toLowerCase()
						if (answer === 'y'
							|| answer === ''
							|| answer === 'yes') {
							resolve()
						} else {
							reject("Operation canceled")
						}
					})
				} else {
					resolve()
				}
			})
		}
	})
}

function bundle () {
	return new Promise(function (resolve, reject) {
		console.log("Browserifying")
		compile.release(jsIn, {}, function (err, code) {
			if (err) {
				reject(err)
			} else {
				resolve(code.toString())
			}
		})
	})
}

function uglify (input) {
	var ast = uglifyjs.parse(input)
		, compressor = uglifyjs.Compressor()

	ast.figure_out_scope()
	ast = ast.transform(compressor)

	// need to figure out scope again so mangler works optimally
	ast.figure_out_scope()
	ast.compute_char_frequency()
	ast.mangle_names()

	// get Ugly code back :)
	return ast.print_to_string()
}

function save (code) {
	return writeFile(jsOut, code, 'utf8')
}

function stamp () {
	var timestamp = "/*" + now() + "*/"
	console.log("Stamping " + jsOut)
	return appendFile(jsOut, timestamp, 'utf8')
}

function now () {
	var date = new Date()
		, dateTime = date.getUTCFullYear()
			+ "/"
			+ (date.getUTCMonth() + 1)
			+ "/"
			+ date.getUTCDate()
			+ " "
			+ date.getUTCHours()
			+ ":"
			+ date.getUTCMinutes()
			+ ":"
			+ date.getUTCSeconds()
	return dateTime
}

function minify () {
	console.log("Minifying")
	readFile( cssIn, 'utf8' )
		.then(function ( source ) {
			var minified = new CleanCSS().minify( source );
			return writeFile(cssOut, minified, 'utf8')
		})
}

function build () {
	return new Promise(function (resolve, reject) {
		fs.exists(htmlIn, function (exists) {
			if (exists) {
				resolve(readFile(htmlIn, 'utf8')
					.then(function (str) {
						console.log("Creating build.html")
						return writeFile(htmlOut
							, str.replace('<link href="bundle.css" rel="stylesheet" type="text/css">'
									, '<link href="build.css" rel="stylesheet" type="text/css">')
								.replace('<script src="bundle.js" type="text/javascript"></script>'
									, '<script src="build.js" type="text/javascript"></script>')
							, 'utf8')
					})
				)
			} else {
				reject("Can't find index.html")
			}
		})
	})
}

function bumpVersion () {
	return new Promise(function (resolve, reject) {
		fs.exists(pkg, function (exists) {
			if (exists) {
				console.log('pkg', pkg)
				resolve(readFile(pkg, 'utf8')
					.then(function (str) {
						var data = JSON.parse(str)
						data.version = bump(data.version)
						console.log("Bumping version in package.json")
						return writeFile(pkg, JSON.stringify(data, null, 2), 'utf8')
					})
				)
			} else {
				reject("Can't find package.json")
			}
		})
	})
}

function bump (version) {
	var parts = version.split('.')
	parts[parts.length - 1] = parseInt(parts[parts.length - 1], 10) + 1
	return parts.join('.')
}

function sh (command) {
	return new Promise(function (resolve, reject) {
		console.log('Executing `', command, '`\n\tCWD:', root )

		proc.exec(command
			, { cwd: root }
			, function (error, stdout, stderr) {
			if (error) {
				reject(error)
			} else {
				resolve()
			}
		})
	})
}

function end () {
	console.log("END")
	rl.close()
}
