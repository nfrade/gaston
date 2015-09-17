window.isNode = false;
window.gaston = window.gaston || {};
window.gaston.log = require('./log');

window.chai.use( require( '../tester/chai/performance' ) )
window.chai.use( require( '../tester/chai/message' ) )
