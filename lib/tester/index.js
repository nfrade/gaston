var Tester = module.exports = function (options) {
  var self = this
  options = self.options = options || {}
  self.source = options.source
  self.file = options.file

  self.stream = options.stream
  var runners = options.runners
  self.runners = Array.isArray(runners) ? runners : [runners]

  for (var i = 0, l = self.runners.length; i < l; i++) {
    var runnerName = self.runners[i]

    // for plugins in node_modules
    if (!Tester.runners[runnerName]) {
      try {
        Tester.runners[runnerName] = require(runnerName)
      } catch (ex) {
        throw ex && Error('no such test runner: ' + runnerName)
      }
    }
  }
}

Tester.runners = {
  node: require('./runners/node'),
  phantom: require('./runners/phantom'),
  common: require('./runners/common'),
  all: require('./runners/all')
}

Tester.prototype.run = function () {
  var self = this

  // [TODO] how to do this?
  // if(self.stream){
  //   process.stdout.on('data', function(buf){
  //     self.stream.write(buf)
  //   })
  //   process.stdout.pipe( self.stream )
  // }

  return self.runners.reduce(function (a, b) {
    var runner = Tester.runners[b]
    return a.then(function (errors) {
      return runner(self.options, errors)
    })
  }, Promise.resolve(0))
    .catch(function (err) {
      console.log(err)
    })
}
