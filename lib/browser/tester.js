var chai = window.chai = require('chai')
var sinon = window.sinon = require("sinon")
var sinonChai = window.sinonChai = require("sinon-chai")

window.isNode = false;
window.gaston = window.gaston || {};
window.gaston.log = require('./log');

// var should = window.should = chai.should();
var expect = window.expect = chai.expect
var assert = window.assert = chai.assert

//this has to be used by node as well!
chai.use( sinonChai )
chai.use( require( '../tester/chai/performance' ) )
chai.use( require( '../tester/chai/message' ) )

mocha.ui('bdd')
mocha.reporter('html')
