var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , spawn = require('child_process').spawn
  , gaston = require('../../')
  , getFiles = require('../utils/get-files')
  , copyDependencies = require('../utils/copy-dependencies')
  , tmpdir = require('os').tmpdir()
  , dependencies = [
    'node_modules/mocha/mocha.js',
    'node_modules/mocha/mocha.css',
    'gaston-files/test-runner.html'
  ];

var phantom = module.exports = function phantom(source, errors, dir){
  var testPath = path.join(source, dir || 'phantom');
  log.info('gaston tester', 'running phantom tests from', testPath);

  return copyDependencies(dependencies, source, tmpdir)
    .then(function(){
      return getFiles(source, dir || 'phantom')
    })
    .then(function(files){ 
      var browserFile = path.join(__dirname, '../browser.js');
      files.unshift(browserFile);
      return gaston.bundle({
        source: files
      })
    })
    .then(function(bundle){
      var bundlePath = path.join(tmpdir, 'bundle.js');
      return fs.writeFileAsync(bundlePath, bundle.js, 'utf8');
    })
    .then( function(){
      return runTests(errors);
    });
};

var runTests = function runTests(errors){
  return new Promise(function(resolve, reject){
    var indexPath = path.join(tmpdir, 'test-runner.html');

      var mpjsPath = path.join( __dirname, '../../../', 'node_modules', '.bin', 'mocha-phantomjs')
      exec = spawn(mpjsPath, [
        indexPath
      ]);

    exec.stdout.pipe(process.stdout);

    exec.on('close', function (code, signal) {
      resolve(errors + code);
    });
  });
};
