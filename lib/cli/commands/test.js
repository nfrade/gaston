var log = require('npmlog')
var path = require('path')
var Tester = require('../../tester')
var backtrackFile = require('../../utils/backtrack-file')

module.exports = function test (args) {
  var runners = args.r || args.runner || 'all'
  var source = args.s || args.source

  if (source && !path.isAbsolute(source)) {
    source = path.join(process.cwd(), source)
  }

  if (!source) {
    var packagePath = backtrackFile('package.json', process.cwd())
    source = path.join(path.dirname(packagePath), 'test')
  }

  var options = {
    runners: runners,
    source: source
  }

  var tester = new Tester(options)
  return tester.run()
    .then(function (errors) {
      log.info('gaston test', errors, 'tests failed')
      return errors
    })
}
