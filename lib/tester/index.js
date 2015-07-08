var chai = exports.chai = require('chai');

chai.use(function (_chai, _ ) {
  _chai.Assertion.addMethod('msg', function (msg) {
    _.flag(this, 'message', msg)
  })
});

mocha.ui('bdd')
mocha.reporter('html')

exports.it = window.it;
exports.describe = window.describe;
should = exports.should = chai.should();
exports.expect = chai.expect;