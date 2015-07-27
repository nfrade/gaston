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

  Assertion.addMethod('performance', function( params, done ) {
   
    var fn = this._obj;
    var assertion = this
    var compare

    new Assertion(fn).to.be.a.function

    if(typeof params === 'function') {
      var condition = {
        method: params
      }
      compare = performance( condition )
    }
    else if(typeof params !== 'object') {
      params = { time: params }
    }

    function complete( single, avtime ) {
      perfAssert( single*1000, 'time', assertion, params, done )
      perfAssert( 
        avtime*1000, 
        'average', 
        assertion, 
        params, 
        done, 
        'average execution time over n='+params.loop
       )
    }

    if( compare ) {
      return compare.then(function( single, avtime ) {
        params = {}
        params.complete = void 0
        params.method = fn
        params.time = (single*1000) 
        params.margin = 1.03
        //take 10% margin
        performance( params ).done( complete )
      })
    } else {
      params.method = fn
      return performance( params ).done( complete )
    }

  })

  function perfAssert( measure, field, assertion, params, done, msg, unit, round  ) {
    var field = params[field]
    var margin = params.margin || 1

    if( field ) {
      round = Math.pow( 10, (round || 2) )
      measure = measure
      measure = Math.round(measure*round)/round
      unit = unit || 'ms'
      if(measure > field*margin) {
        console.error('FAIL!', field,  measure < field)
        assertion.assert(
          measure < field*margin,
          ( msg ? msg( params ) : 'execution time' )
           + ' [ +' +  Math.round((measure-field)*round)/round + ' ' + unit +' ]' 
          + '[ +' + Math.round( (measure/(field))*round-100 ) + '% ]'
          + '\nexecuted in: '+ measure + ' ' + unit
        )
      }
      if(done) {
        done()
      }
    }
  }

})

mocha.ui('bdd')
mocha.reporter('html')
