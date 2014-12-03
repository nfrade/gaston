#!/usr/bin/env node
var fs = require('fs')
	, path = require('path')
	, readline = require('readline')
	, proc = require('child_process')

	, Promise = require('promise')

	, root = process.cwd()
	, jsIn = path.join(root, 'bundle.js')
	, jsOut = path.join(root, 'build.js')
	, cssIn = path.join(root, 'bundle.css')
	, cssOut = path.join(root, 'build.css')
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
	.then(uglify)
	.then(stamp)
	.then(minify)
	.then(bumpVersion)
	.then(end)
	.catch(function (reason) {
		console.error("FAIL", reason)
		end()
	})

function inReady () {
	return Promise.all([jsIn, cssIn].map(function (file) {
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

function uglify () {
	console.log("Uglifying")
	return sh("uglifyjs " + jsIn + " -m > " + jsOut)
}

function stamp () {
	console.log("Stamping " + jsOut)
	return appendFile(jsOut, "/*" + now() + "*/", 'utf8')
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
	return sh("cleancss -o " + cssOut + " " + cssIn)
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
	rl.close()
}
