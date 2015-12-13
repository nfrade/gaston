'use strict'

require('./style.less');

var Observable = require('vigour-js/lib/observable')
Observable.prototype.inject(
  require('vigour-js/lib/operator/subscribe'),
  require('vigour-js/lib/operator/transform')
)
var Element = require('vigour-element');
Element.prototype.inject(
  require('vigour-element/lib/property/text'),
  require('vigour-element/lib/property/css'),
  require('vigour-element/lib/property/transform')
);
var ui = require('vigour-uikit/lib');

var projects = [
  {
    name: 'Project 1'
  },
  {
    name: 'Project 2'
  },
  {
    name: 'Project 3'
  },
  {
    name: 'Project 4'
  }
];

var data = new Observable({
  content: projects
})
var Item = new Element({
  name: {
    text: {
      $: 'name'
    }
  }
}).Constructor
// window.gaston.api.getProjects().then((projects) => {
//   console.log(projects);
// });

var ProjectList = require('./project-list.js');

module.exports = new Element({
  val: data,
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
  projectList: {
    ChildConstructor: Item,
    $: 'content'
  }
  // projectList: ProjectList(projects)
});

