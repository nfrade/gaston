require('./styles.less');

require('./module');

var Base = require('vjs/lib/base')

console.log('in src/index.js');

var a = new Base({
  b: 'bbbbbbbbb'
});

console.log('a', a);