"use strict";

var through = require('through2')

var replacer = module.exports = function replacer(map){
  var keys = Object.keys(map);
  return through(function replacer(buf, enc, next){
    var data = buf.toString('utf8');
    for(let i = 0, l = keys.length; i < l; i++){
      let key = keys[i];
      let placeholder = '{{' + key + '}}';
      let value = map[key];
      data = data.replace(placeholder, value);
    }
    this.push(data);
    return next();
  });
};