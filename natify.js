var fs = require('graceful-fs')
	, exec = require('child_process').exec

module.exports = exports = {
	create: function (cwd, cordovaDirectoryName, rdsid, displayName, cb) {
		console.log('running `cordova create ...`')
		exec('cordova create '
			+ cordovaDirectoryName
			+ ' '
			+ rdsid
			+ ' '
			+ cordovaDirectoryName
			, { cwd: cwd }
			, function (error, stdout, stderr) {
				cb(error)
			})
	}
	, getPlatforms: function (cwd, cordovaDirectoryName, cb) {
		var dir = cwd + '/' + cordovaDirectoryName
		console.log('running `cordova platforms list`')
		exec('cordova platforms list'
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
		console.log('running `cordova platform add ...`')
		exec('cordova platform add ' + s.join(' ')
			, { cwd: dir }
			, function (error, stdout, stderr) {
					cb(error)
			})
	}
	, populate: function (cwd, cordovaDirectoryName, cb) {
		console.log('copying source files into www directory')
		exec('rsync -r * '
			+ cordovaDirectoryName
			+ '/www --exclude '
			+ cordovaDirectoryName
			, { cwd: cwd }
			, function (error, stdout, stderr) {
				cb(error)
			})
	}
	, run: function (cwd, cordovaDirectoryName, selectedPlatforms, flag, cb) {
		exports.populate(cwd, cordovaDirectoryName, function (error) {
			var dir = cwd + '/' + cordovaDirectoryName
			if (error) {
				cb(error)
			} else {
				console.log('running `cordova run ...`')
				exec('cordova run ' + selectedPlatforms.join(' ') + ' ' + flag
					, { cwd: dir }
					, function (error, stdout, stderr) {
						console.log(stderr)
						cb(error)
					})
			}
		})
	}
}