'use strict'

var Element = require('vigour-element');
Element.prototype.inject(
  require('vigour-element/lib/property/text'),
  require('vigour-element/lib/property/css')
);
var ui = require('vigour-uikit/lib');

module.exports = function(projects) {
  return projects.map(function (project) {
    return new ui.Row({ css: {
        addClass: 'project-row'
      },
      'project-actions': {
        'unregister-bt': new ui.Button({
          text: '',
          css: {
            addClass: 'ui-small ui-grayscale-light'
          },
          icon: new ui.Icon('folder-minus'),
          label: {
            node: 'span',
            text: 'Unregister Project'
          }
        }),
        'stop-bt': new ui.Button({
          text: '',
          css: {
            addClass: 'ui-small ui-grayscale-light'
          },
          icon: new ui.Icon('pause2'),
          label: {
            node: 'span',
            text: 'Stop'
          }
        })
      },
      'project-name': new ui.A({
        text: project
      })
    });
  });
};

