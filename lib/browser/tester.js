var chai = window.chai = require('chai');
// var should = window.should = chai.should();
var expect = window.expect = chai.expect;
var assert = window.assert = chai.assert;
var performance = require('../performance')

//this has to be used by node as well!
chai.use(function( chai, _ ) {
  
  var Assertion = chai.Assertion
  
  Assertion.addMethod('msg', function (msg) {
    _.flag(this, 'message', msg)
  })

  Assertion.addMethod('performance', function( params ) {
   
    var fn = this._obj;
    var assertion = this

    new Assertion(fn).to.be.a.function

    if(typeof params !== 'object') {
      params = { time: params }
    }

    params.method = fn

    params.complete = function( single, avtime ) {
      
      console.log( 'perf in mocha!', arguments )

      perfAssert( single*1000, 'time', assertion, params )
      
      perfAssert( avtime*1000, 'average', assertion, params, function( params ) {
        return 'average execution time over n='+params.loop
      })

    }

    performance( params )

  })

  function perfAssert( measure, field, assertion, params, msg, unit, round  ) {
    var field = params[field]
    if( field ) {
      round = Math.pow( 10, (round || 2) )
      measure = measure
      measure = Math.round(measure*round)/round
      unit = unit || 'ms'
      if(measure > field) {
        assertion.assert(
          measure < field,
          ( msg ? msg( params ) : 'execution time' )
           + ' [ +' +  Math.round((measure-field)*round)/round + ' ' + unit +' ]' 
          + '[ +' + Math.round(measure/field*round) + '% ]'
          + '\nexecuted in: '+ measure + ' ' + unit
        )
      }
    }
  }

})

mocha.ui('bdd')
mocha.reporter('html')
