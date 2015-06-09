//gaston-client
var browserify = require('browserify')
	, path = require('path')
	, fs = require('fs');

module.exports = function() {
	return new Promise(function(resolve, reject) {

		console.log('lets browserify compuled')

		var b = browserify( path.join(__dirname, '../browser', 'gaston.js') );
		

		b.require( path.join(__dirname, '../browser', 'user-agent.js'), { expose: 'user-agent' } );
		//TODO: fix - somehow this does nto compile files above lib/browser
		//need to expose all


		var transform = require( path.join(__dirname, './compilers/gaston-browser-transform') );
		b.transform(transform);
		
		var gastonCompiledPath = path.join(__dirname, '../browser', 'gaston-compiled.js')

		var output = fs.createWriteStream( gastonCompiledPath );

		var file = new Buffer()

		b.bundle()
		  .pipe( output );
		  .on(function(chunk) {
		  	file.push(chunk)
		  })

		output.on('close', function() {
			console.log('!!!!done browserify!!!');

			fs.readFileSync( gastonCompiledPath )

			setTimeout(resolve,10000)
		});

		b.on('error', function(err){
		  console.log('error', err);
		  reject(err);
		});

	});
};