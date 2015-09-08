var config = module.exports = function config(io, args){

  var payload = {
    key: args._[1],
    val: args._[2]
  };

  io.socket.emit('config', payload);
};