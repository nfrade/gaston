module.exports = exports = {}
exports.asyncEach = function (arr, action, cb) {
	var l = arr.length
		, nbLeft = l
		, i
		, errors = []
	for (i = 0; i < l; i += 1) {
		action(arr[i], function (err) {
			if (err) {
				errors.push(err)
				nbLeft -= 1
				done()
			} else {
				nbLeft -= 1
				done()
			}
		})
	}
	function done () {
		if (cb && nbLeft === 0) {
			if (errors.length > 0) {
				cb(errors)
			} else {
				cb(null)
			}
		}
	}
}