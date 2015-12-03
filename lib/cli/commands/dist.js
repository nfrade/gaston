'use strict'
var fs = require('vigour-fs-promised')
var path = require('path')
var log = require('npmlog')
var promisify = require('bluebird').promisify
var glob = promisify(require('multi-glob').glob)
var mkdirp = promisify(require('mkdirp'))
var rimraf = promisify(require('rimraf'))
var backtrackFile = require('../../utils/backtrack-file')
var replacer = require('../../utils/replacer')
var pkgPath = backtrackFile('package.json', process.cwd())
var pkg = require(pkgPath)
var basePath = path.dirname(pkgPath)

module.exports = function dist (args) {
	var distOptions = pkg.gaston && pkg.gaston.dist
	if(!distOptions){
		throw Error('no dist options in gaston section of package.json')
	}
  
	var root = path.join(basePath, distOptions.root || '.')

	return rimraf(path.join(basePath, 'dist'))
		.then(() => glob(distOptions.files, {cwd: root}))
		.then((files) => {
			var promises = []
			for(var i = 0, l = files.length; i < l; i++){
				var file = files[i]
				;(function(origin, target){
					var promise = mkdirp(path.dirname(target))
						.then(() => {
							return new Promise((resolve, reject) =>{
								var rStream = fs.createReadStream(origin)
								var wStream = fs.createWriteStream(target)
								log.info('gaston', 'creating', target)
								wStream.on('close', resolve)
								rStream.pipe(wStream)
							})
						})
					promises.push(promise)
				})(path.join(root, file), path.join(basePath, 'dist', file))
			}
			return Promise.all(promises)
				.then(() => log.info('gaston', 'dist created successfully'))
				.then(() => files)
		})
		.then((files) => {
			if(pkg.gaston.dist.appcache){
				return handleAppCacheManifest(files)
			}
		})
}

var handleAppCacheManifest = function(files){
	var distPath = path.join(basePath, 'dist')
	var gastonFilesPath = path.join(__dirname, '../../../gaston-files')
	var buildHtmlPath = path.join(distPath, 'build.html')
	return fs.readFileAsync(path.join(gastonFilesPath, 'application.appcache'), 'utf8')
		.then((data) => {
			data = data.replace('{version}', 'v'+pkg.version)
			data = data.replace('{cached-files}', files.join('\n'))
			return fs.writeFileAsync(path.join(distPath, pkg.name + '.appcache'), data, 'utf8')
		})
		.then(() => fs.readFileAsync(buildHtmlPath, 'utf8'))
		.then((data) => data = data.replace('<html', `<html manifest="${pkg.name}.appcache"`))
		.then((data) => fs.writeFileAsync(buildHtmlPath, data, 'utf8'))
}