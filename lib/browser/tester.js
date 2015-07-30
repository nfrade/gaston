var chai = window.chai = require('chai');
var spies = require('chai-spies');
// var should = window.should = chai.should();
var expect = window.expect = chai.expect;
var assert = window.assert = chai.assert;
var performance = require('../performance')

//this has to be used by node as well!
chai.use( spies )

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

    if( typeof params === 'function' ) {
      var condition = {
        method: params
      }
      compare = performance( condition )
    }
    else if( typeof params !== 'object' ) {
      params = { time: params }
    } else if( params.method ) {
      var condition = {
        method: params.method
      }
      compare = performance( condition )
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
        params = {
          margin: params.margin || 1.05
        }
        params.complete = void 0
        params.method = fn
        params.time = (single*1000) 
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

      console.group()

      console.log( 
        '%cgaston performance test:', 'color: black; padding:3px; font-weight:bold;'
      ) 

      console.log(
        '%c'
        + ( assertion.__flags.message 
          ? ( '"' + assertion.__flags.message + '"' )
          : assertion._obj.toString()
          ),
        'color: grey; width:100px; display:block; height:auto;'
      )

      console.log(
        '%c' +  measure + ' ' + unit + ' | ' + ((100-Math.round((measure/(field))*-round))-100) + '%',
        measure > field*margin 
          ? 'color: red; padding:3px; font-weight:bold;' 
          : 'color: green; padding:3px; font-weight:bold;' 
      )

      console.log(
        '%c' + Math.round((field)*round)/round + ' '+ unit 
         + ( params.margin 
           ? ' | margin: '+ params.margin +' | limit: ' + Math.round((field*margin)*round)/round  + ' ' + unit
           : ''
           ),
        'color: grey; padding:3px; font-weight:bold;' 
      )

      console.groupEnd()

      if( measure > field*margin ) {
        assertion.assert(
          measure < field*margin,
          ( msg ? msg( params ) : 'execution time' )
           + ' [ +' +  Math.round((measure-field)*round)/round + ' ' + unit +' ]' 
          + '[ +' + Math.round( (measure/(field))*round-100 ) + '% ]'
          + '\nexecuted in: '+ measure + ' ' + unit
        )
      }
      if( done ) {
        done()
      }
    }
  }

})

mocha.ui('bdd')
mocha.reporter('html')
