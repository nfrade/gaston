var chai = window.chai = require('chai');
// var should = window.should = chai.should();
var expect = window.expect = chai.expect;
var assert = window.assert = chai.assert;


//this has to be used by node as well!

chai.use(function (_chai, _ ) {
  _chai.Assertion.addMethod('msg', function (msg) {
    _.flag(this, 'message', msg)
  })
});

chai.use(function (_chai, _ ) {
  _chai.Assertion.addMethod('performance', function (msg) {
    

    //console.log('performance hooks')

  })
});

mocha.ui('bdd');
mocha.reporter('html');
