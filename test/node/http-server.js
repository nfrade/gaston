var http = require('http')
  , server = require('../../daemon/http-server')
  , ip = require('ip')
  , thisIP = ip.address()
  , PORT = 9022;

describe('testing the HTTP server', function(){

  describe('starting the server', function(){
    it('should start the Server', function(done){
      var options = {
        basePath: process.cwd(),
        port: PORT
      }
      server.start( options )
        .then(function(){
          assert.equal( server.port, PORT );
          assert.ok( server.listening );
        })
        .done( done );
    });

  });

  describe('making requests to the server', function(){
    var url = 'http://' + thisIP + ':' + PORT + '/';

    it('should return status 200 for GET request to the root path', function(done){
      http.get(url, function(res){
        assert.equal(res.statusCode, 200);
        done();
      });
    });

    it('should return status 404 for GET request inexistant path', function(done){
      http.get(url + 'some-path', function(res){
        assert.equal(res.statusCode, 404);
        done();
      });
    });
  });

  describe('stopping the server', function(){
    it('should stop the server', function(done){
      server.stop()
        .then(function(){
          assert.notOk( server.listening );
        })
        .done( done );
    })
  })

});