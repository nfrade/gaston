var chai = window.chai = require('chai');
var should = window.should = chai.should();
var expect = window.expect = chai.expect

chai.use(function (_chai, _ ) {
  _chai.Assertion.addMethod('msg', function (msg) {
    _.flag(this, 'message', msg)
  })
});

mocha.ui('bdd')
mocha.reporter('html')

