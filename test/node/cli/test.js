var exec = require('child_process').exec

describe('gaston test', function(){
  this.timeout(20000)
  it('should run all the tests in meta-tests', function(done){
    exec('gaston test -s ./test/meta-tests -r all', done)
  })

  it('should fail with the number of failing tests', function(done){
    exec('gaston test -s ./test/meta-tests/failing.js -r node', function(err){
      assert.ok(err.code, 3)
      done()
    })
  })

});