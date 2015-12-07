'use strict'

require('./style.less');

var Element = require('vigour-element');
Element.prototype.inject(
  require('vigour-element/lib/property/text'),
  require('vigour-element/lib/property/css')
);
var ui = require('vigour-uikit/lib');

var projects = [
  'project-1',
  'project-2',
  'project-3',
  'project-4',
  'project-5',
  'project-6'
];

var ProjectList = require('./project-list.js');

module.exports = new Element({
  projectListHeader: new ui.Row({
    projectListTitle: new ui.H2({
      text: 'Registered Projects:'
    }),
    'register-new-project': new ui.Button({
      text: 'Register New Project',
      icon: new ui.Icon('folder-plus'),
      css: {
        addClass: 'ui-big'
      }
    })
  }),
  projectList: ProjectList(projects)
});

