var API = require('../../daemon/api')
  , PORT = 64000 + Math.floor( Math.random() * 1000)
  , client = require('socket.io-client')
  , io;

describe('testing the api', function(){

  it('should start the API', function(done){
    API.start( {port: PORT} )
      .then(function(){
        assert.ok( API.running );
      })
      .done( done );
  });

  it('should have started with the right port', function(){
    assert.ok(API.port, PORT);
  });

  it('should be able to connect', function(done){
    io = client('http://localhost:' + PORT);
    io.on('connect', function(){
      done();
    });
  });
  
  it('should be able to disconnect', function(done){
    io.on('disconnect', function(){
      done()
    });
    io.disconnect();
  });

  it('should stop the API', function(done){
    API.stop()
      .then(function(){
        assert.notOk( API.running );
      })
      .done( done );
  });

})