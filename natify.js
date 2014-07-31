var fs = require('graceful-fs')
	, exec = require('child_process').exec

module.exports = exports = {
	create: function (cwd, directoryName, rdsid, displayName, cb) {
		exec('cordova create '
			+ directoryName
			+ ' '
			+ rdsid
			+ ' '
			+ displayName
			, { cwd: cwd }
			, function (error, stdout, stderr) {
				cb(error)
			})
	}
	, hasPlatforms: function (cwd, cb) {
		exec('cordova platforms list'
			, { cwd: cwd }
			, function (error, stdout, stderr) {
				var platforms
					, installed
					, available
				if (error) {
					console.error(error)
				} else {
					platforms = stdout.split('\n')
					installed = platforms[0]
						.slice("Installed platforms: ".length)
						.split(', ')
					available = platforms[1]
						.slice("Available platforms: ".length)
						.split(', ')
					;(installed && installed[0] !== '')
						? cb(true, available)
						: cb(false, available)
				}
			})
	}
	, installPlatforms: function (cwd, selectedPlatforms, cb) {
		var s = JSON.parse(selectedPlatforms)
		exec('cordova platform add ' + s.join(' ')
			, { cwd: cwd }
			, function (error, stdout, stderr) {
				if (error) {
					cb(error)
				} else {
					cb()
				}
			})
	}
	, populate: function (cwd, cordovaDirectoryName, cb) {
		exec('rsync -r * ' + cordovaDirectoryName + '/www --exclude ' + cordovaDirectoryName
			, { cwd: cwd }
			, function (error, stdout, stderr) {
				if (error) {
					cb(error)
				} else {
					exec('cordova build'
				  	, { cwd: cwd + '/' + cordovaDirectoryName}
				  	, function (error, stdout, stderr) {
				  		cb(error)
				  	})
				}
			})
	}
}