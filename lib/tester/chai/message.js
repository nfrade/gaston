/*
  message
  expect( ... ).msg( 'error message' ).to.be...
*/
module.exports = function( chai, _ ) {
  var Assertion = chai.Assertion
  Assertion.addMethod('msg', function (msg) {
    _.flag(this, 'message', msg)
  })
}