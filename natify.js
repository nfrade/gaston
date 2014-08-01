var fs = require('graceful-fs')
	, exec = require('child_process').exec

function logCommand (cwd, command) {
	console.log('in `' + cwd + '`\n\trunning `' + command + '`')
}

function done (cb) {
	return function (error, stdout, stderr) {
		console.log('\t\tstdout: ', stdout)
		console.log('\t\tstderr: ', stderr)
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
					, i
				if (error) {
					cb(error)
				} else {
					platforms = stdout.split('\n')
					installed = platforms[0]
						.slice("Installed platforms: ".length)
						.split(', ')
					available = platforms[1]
						.slice("Available platforms: ".length)
						.split(', ')
					for (i = installed.length - 1; i >= 0; i -= 1) {
						installed[i] = installed[i].split(' ')[0]
					}
					cb(null, {
						installed: installed
						, available: available
					})
				}
			})
	}
	, attemptRun: function (cwd, cordovaDirectoryName, selectedPlatforms, flag, cb) {
		exports.getPlatforms(cwd, cordovaDirectoryName, function (error, data) {
			var i
				, needAdding
			if (error) {
        cb(error)
      } else {
      	i = selectedPlatforms.length - 1
      	needAdding = []
      	for (; i >= 0; i -= 1) {
      		if (!(~data.installed.indexOf(selectedPlatforms[i]))) {
      			needAdding.push(selectedPlatforms[i])
      		}
      	}
        if (needAdding.length > 0) {
        	exports.installPlatforms(cwd, cordovaDirectoryName, needAdding, function (error) {
        		if (error) {
        			cb(error)
        		} else {
        			exports.run(cwd, cordovaDirectoryName, selectedPlatforms, flag, cb)
        		}
        	})
        } else {
        	exports.run(cwd, cordovaDirectoryName, selectedPlatforms, flag, cb)
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
	, run: function (cwd, cordovaDirectoryName, selectedPlatforms, flag, cb) {
		exports.populate(cwd, cordovaDirectoryName, function (error) {
			var dir
				, command
			if (error) {
				cb(error)
			} else {
				dir = cwd + '/' + cordovaDirectoryName
				command = 'cordova run ' + selectedPlatforms.join(' ') + ' ' + flag
				logCommand(dir, command)
				exec(command, { cwd: dir }, done(cb))
			}
		})
	}
}