var backtrackFile = require('../../utils/backtrack-file')
var pkgPath = backtrackFile('package.json', process.cwd())
var pkg = require(pkgPath)
console.log(pkg)

module.exports = function dist (args) {
	var distOptions = pkg.gaston && pkg.gaston.dist
	if(!distOptions){
		throw Error('no dist options in gaston section of package.json')
	}
}