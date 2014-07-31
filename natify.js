var fs = require('graceful-fs')
	, exec = require('child_process').exec

module.exports = exports = {
	build: function (cordovaDirectory, cb) {
	  cb("Let's build")
	}
	, create: function (cwd, directoryName, rdsid, displayName, cb) {
		exec('cordova create ' + directoryName + ' ' + rdsid + ' ' + displayName
			, { cwd: cwd }
			, function (error, stdout, stderr) {
				console.log(error)
				console.log(stdout)
				console.log(stderr)
				cb(error)
			})
	}
}





// var child = exec('cordov -v', function (error, stdout, stderr) {
//       if (error !== null) {
//         cb(error.toString() + ". Have you installed cordova? `npm install -g cordova`")
//       } else {
//         cb()
//       }
//     })