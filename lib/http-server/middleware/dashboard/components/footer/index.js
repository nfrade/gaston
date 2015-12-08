'use strict'

require('./style.less');

var Element = require('vigour-element');
var ui = require('vigour-uikit/lib');

module.exports = new Element({
  node: 'footer',
  info: new ui.P({
    text: 'Gaston by ',
    'vigour-link': new ui.A({
      text: 'Vigour',
      href: 'http://vigour.io',
      attributes: {
        target: '_blank'
      }
    })
  })
});

