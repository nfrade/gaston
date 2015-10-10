var babelify = module.exports = require('babelify')
babelify.configure({
  whitelist: [
    'es6.arrowFunctions',
    'es6.blockScoping',
    'es6.classes',
    'es6.constants',
    'es6.parameters',
    'es6.properties.shorthand',
    'es6.properties.computed',
    'es6.destructuring',
    'es6.forOf',
    'es6.modules',
    'es6.spread',
    'es6.tailCall',
    'es6.templateLiterals',
    'es6.regex.unicode',
    'es6.regex.sticky'
  ]
})
