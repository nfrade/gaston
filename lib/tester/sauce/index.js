var getFiles = require('../get-files')
  , compile = require('../compile')
  , log = require('npmlog')
  , Promise = require('bluebird')
  , path = require('path')
  , config = require('../../config');

module.exports = testSauce;

function testSauce (reqPath) {
  return getFiles(reqPath)
    .then(function(files){
      log.info('tester', 'compiling test files');

      var tester = path.join(__dirname, '../../', 'browser', 'sauce.js');
      files.unshift( tester )
      files = files.filter(function(file){
        return file.indexOf('bundle') === -1;
      });

      return files;
    })
    .then(compile)
    .then(function () {
      log.info('tester', 'finished compiling');
      log.info('tester', 'connecting to saucelabs');

      return new Promise(function(fulfill, reject) {
        if (!process.env['SAUCE_USERNAME'] && !process.env['SAUCE_ACCESS_KEY']) {
          log.error('tester', 'You need to specify environment variables SAUCE_USERNAME and SAUCE_ACCESS_KEY in order to try to connect to saucelabs');
          return reject();
        }

        var KarmaServer = require('karma').Server;
        var karmaConfig = getKarmaConfig();
        var karmaServer = new KarmaServer(karmaConfig);

        karmaServer.on('browser_error', function(browser, error) {
          log.error('tester', 'Error in browser: ' + browser.name);
          log.error('tester', error);

          reject();
        });

        karmaServer.on('run_complete', function(browsers, results) {
          if (results.success > 0 || results.failed > 0) {
            fulfill(results.failed);
          } else if (results.disconnected || results.exitCode > 0) {
            log.error('tester', "Sauce labs couldn't connect properly");
            log.info( 'tester', JSON.stringify(results));

            reject();
          } else {
            fulfill(0);
          }
        });

        karmaServer.start();
      });

    });
}

function getKarmaConfig () {
  var pkgConfig = config.pkg && config.pkg.gaston && config.pkg.gaston.sauce;

  var karmaConfig = {
    port: (pkgConfig && pkgConfig.port) || 9876,
    reporters: (pkgConfig && pkgConfig.reporters) || ['dots', 'saucelabs'],
    captureTimeout: (pkgConfig && pkgConfig.captureTimeout) || 120000,
    browserNoActivityTimeout: (pkgConfig && pkgConfig.browserNoActivityTimeout) || 60000,
    files: [ config.bPath ],
    frameworks: ['mocha', 'chai', 'sinon-chai'],
    singleRun: true,
    sauceLabs: {
      testName: 'Karma and Sauce Labs demo'
    },
    customLaunchers: getCustomLaunchers(),
    browsers: Object.keys(getCustomLaunchers()),
  };

  return karmaConfig;
}

function getCustomLaunchers () {
  var pkgCustomLaunchers = config.pkg && config.pkg.gaston && config.pkg.gaston.sauce
    && config.pkg.gaston.sauce.customLaunchers;

  return pkgCustomLaunchers ||  {
    'SL_Chrome': {
      base: 'SauceLabs',
      browserName: 'chrome'
    },
    'SL_InternetExplorer': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      version: '10'
    },
    'SL_FireFox': {
      base: 'SauceLabs',
      browserName: 'firefox',
    }
  };
}
