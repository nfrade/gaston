var fs = require('graceful-fs')
	, exec = require('child_process').exec
	, log = require('npmlog')

function logCommand (cwd, command) {
	log.info('in `' + cwd + '`\n\trunning `' + command + '`')
}

function done (cb) {
	return function (error, stdout, stderr) {
		console.log(stdout)
		console.log(stderr)
		cb(error)
	}
}

module.exports = exports = {
	create: function (cwd, cordovaDirectoryName, rdsid, displayName, cb) {
		var command = 'cordova create '
			+ cordovaDirectoryName
			+ ' '
			+ rdsid
			+ ' '
			+ cordovaDirectoryName
		logCommand(cwd, command)
		exec(command
			, { cwd: cwd }
			, done(cb))
	}
	, getPlatforms: function (cwd, cordovaDirectoryName, cb) {
		var dir = cwd + '/' + cordovaDirectoryName
			, command = 'cordova platforms list'
		logCommand(dir, command)
		exec(command
			, { cwd: dir }
			, function (error, stdout, stderr) {
				var platforms
					, installed
					, available
					, l
					, i
				if (error) {
					console.log(stderr)
					cb(error)
				} else {
					platforms = stdout.split('\n')
					installed = platforms[0]
						.slice("Installed platforms: ".length)
						.split(', ')
					available = platforms[1]
						.slice("Available platforms: ".length)
						.split(', ')
					l = installed.length
					for (i = 0; i < l; i += 1) {
						installed[i] = installed[i].split(' ')[0]
					}
					cb(null, {
						installed: installed
						, available: available
					})
				}
			})
	}
	, preparePlatforms: function (cwd, cordovaDirectoryName, selectedPlatforms, flag, cb) {
		exports.getPlatforms(cwd, cordovaDirectoryName, function (error, data) {
			var l
				, i
				, needAdding
				, finish = function () {
					exports.getTargets(cwd, cordovaDirectoryName, selectedPlatforms, flag, cb)
				}
			if (error) {
        cb(error)
      } else {
      	l = selectedPlatforms.length
      	needAdding = []
      	for (i = 0; i < l; i += 1) {
      		if (!(~data.installed.indexOf(selectedPlatforms[i]))) {
      			needAdding.push(selectedPlatforms[i])
      		}
      	}
        if (needAdding.length > 0) {
        	exports.installPlatforms(cwd, cordovaDirectoryName, needAdding, function (error) {
        		if (error) {
        			cb(error)
        		} else {
        			finish()
        		}
        	})
        } else {
        	finish()
        }
      }
		})
	}
	, installPlatforms: function (cwd, cordovaDirectoryName, selectedPlatforms, cb) {
		var s = selectedPlatforms
			, dir = cwd + '/' + cordovaDirectoryName
			, command = 'cordova platform add ' + s.join(' ')
		logCommand(dir, command)
		exec(command
			, { cwd: dir }
			, done(cb))
	}
	, getTargets: function (cwd, cordovaDirectoryName, selectedPlatforms, flag, cb) {
		var allTargets = {}
			, l = selectedPlatforms.length
			, nbLeft = l
			, i
		for (i = 0; i < l; i += 1) {
			allTargets[selectedPlatforms[i]] = exports.getPlatformTargets(cwd
				, cordovaDirectoryName
				, selectedPlatforms[i]
				, flag
				, (function (platform) {
					return function (error, targets) {
						if (error) {
							cb(error)
						} else {
							allTargets[platform] = targets
							nbLeft -= 1
							if (nbLeft === 0) {
								cb(null, allTargets)
							}
						}
					}
				}(selectedPlatforms[i])))
		}
	}
	, getPlatformTargets: function (cwd, cordovaDirectoryName, platform, flag, cb) {
		var dir = cwd + '/' + cordovaDirectoryName
			, command = './platforms/'
				+ platform
				+ '/cordova/lib/'
				+ ((flag === '--emulator') ? 'list-emulator-images' : 'list-devices')
				+ ((platform === 'wp8' || platform === 'windows8') ? '.bat' : '')
			, r
		logCommand(dir, command)
		exec(command
			, { cwd: dir }
			, function (error, stdout, stderr) {
				var l
					, i
					, currentTarget
				if (error) {
					console.log(stderr)
					cb(error)
				} else {
					targetArray = stdout
						.slice(0, -1)
						.split('\n')
						.map(function (value, index, arr) {
							return value.replace(/"/g, '')
						}).filter(function (value) {
							return value !== ''
						})
					cb(null, targetArray)            
				}
			})
	}
	, populate: function (cwd, cordovaDirectoryName, cb) {
		var command = 'rsync -r * '
			+ cordovaDirectoryName
			+ '/www --exclude '
			+ cordovaDirectoryName
		logCommand(cwd, command)
		exec(command
			, { cwd: cwd }
			, done(cb))
	}
	, run: function (cwd, cordovaDirectoryName, targets, action, cb) {
		exports.populate(cwd, cordovaDirectoryName, function (error) {
			var dir
				, command
				, flag = (action === 'emulate') ? '--emulator' : '--device'
				, usableTarget
				, l
				, i
				, nbLeft
			if (error) {
				cb(error)
			} else {
				console.log('no error')
				dir = cwd + '/' + cordovaDirectoryName
				l = targets.length
				nbLeft = l
				console.log('targets', targets)
				for (i = 0; i < l; i += 1) {
					usableTarget = (~targets[i].target.indexOf(' ')) ? '"' + targets[i].target + '"' : targets[i].target
					command = 'cordova run '
						+ targets[i].platform
						+ ' '
						+ flag
						+ ' '
						+ '--target=' + usableTarget
					logCommand(dir, command)
					exec(command
						, { cwd: dir }
						, done(function (error) {
							if (error) {
								cb(error)
							} else {
								nbLeft -= 1
								if (nbLeft === 0) {
									cb()
								}
							}
						}))
				}
			}
		})
	}
}