var compile = require('../compile')
compile.release('./index.js', './bundle.js', {}, function () {
  console.log("done")
})