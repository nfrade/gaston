var os = require('os')
var fs = require('vigour-fs-promised')
var path = require('path')
var exec = require('child_process').exec
var tmpdir = path.join(os.tmpdir(), 'gaston-tests')

describe('CLI - gaston bundle', function(){
  this.timeout(20000)
  var error

  before(function(done){
    fs.removeAsync(tmpdir)
      .then(() => fs.mkdirp(tmpdir))
      .then(() => done())
  })

  it('should bundle without errors', function(done){
    var cmd = './bin/gaston bundle -s ./test/sample-app/src/index.js -i -o ' + tmpdir
    exec(cmd, function(err){
      assert.isNull(err)
      done()
    })
  })

  it('should create bundle.js', function(done){
    var pathToTest = path.join(tmpdir, 'bundle.js')
    fs.existsAsync(pathToTest).then(function(exists){
      assert.ok(exists)
      done()
    })
  })

  it('should create bundle.css', function(done){
    var pathToTest = path.join(tmpdir, 'bundle.css')
    fs.existsAsync(pathToTest).then(function(exists){
      assert.ok(exists)
      done()
    })
  })

  it('should create index.html', function(done){
    var pathToTest = path.join(tmpdir, 'index.html')
    fs.existsAsync(pathToTest).then(function(exists){
      assert.ok(exists)
      done()
    })
  })

  describe('index.html should reference the correct files', function(){
    var data
    before(function(done){
      var pathToTest = path.join(tmpdir, 'index.html')
      fs.readFileAsync(pathToTest, 'utf8')
        .then(function(d){
          data = d
          done()
        })
    })

    it('should have script tag to bundle.js', function(){
      assert.ok(~data.indexOf('src="bundle.js"'))
    })

    it('should have link tag to bundle.css', function(){
      assert.ok(~data.indexOf('href="bundle.css"'))
    })
  })

})