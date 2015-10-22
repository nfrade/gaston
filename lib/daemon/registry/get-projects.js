"use strict";

var _ = require('lodash')

module.exports = function projects (options) {
  var socket = this
  if (!options) {
    return getProjects(socket)
  }
}

var getProjects = function (socket) {
  var Config = global.Config
  var projects = _.cloneDeep(Config.projects)
  for (let key in projects) {
    delete projects[key].httpServer
    delete projects[key].pkg
  }
  socket.emit('get-projects', projects)
}
