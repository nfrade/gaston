var through = require('through2')

var replacer = module.exports = function replacer(map){
  var keys = Object.keys(map);
  return through(function replacer(buf, enc, next){
    var data = buf.toString('utf8');
    for(var i = 0, l = keys.length; i < l; i++){
      var key = keys[i];
      var placeholder = '{{' + key + '}}';
      var value = map[key];
      data = data.replace(placeholder, value);
    }
    this.push(data);
    return next();
  });
};