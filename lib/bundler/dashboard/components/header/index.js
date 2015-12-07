'use strict'

require('./style.less');

var Element = require('vigour-element');
var ui = require('vigour-uikit/lib');

module.exports = new Element({
  node: 'header',
  heading: new ui.H1('Gaston Dashboard')
});
