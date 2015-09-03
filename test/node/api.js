var API = require('../../daemon/api')
  , PORT = 64000 + Math.floor( Math.random() * 1000)
  , client = require('socket.io-client')
  , io;

describe('testing the API', function(){

  describe('starting the API', function(){
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
  });

  describe('sending and receiving messages', function(){
    
    it('should handle start command', function(done){
      var httpPort = 9122;
      io.on('started', function(server){
        assert.equal(server.port, httpPort);
        assert.ok(server.listening);
        done();
      })
      io.emit('start', { 
        basePath: process.cwd(), 
        port: httpPort 
      });
    });

    it('should handle stop command', function(done){
      io.on('stopped', function(server){
        assert.notOk(server.listening);
        done();
      })
      io.emit( 'stop' );
    });

  });

  describe('closing the API', function(){
    it('should be able to disconnect', function(done){
      io.on('disconnect', function(){
        done();
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
  });
});