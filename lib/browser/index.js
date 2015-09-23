var server = require('./server-info')
var client = require('../io-client')
var API = require('..')
var UA = require('./user-agent')

var gaston = window.gaston = module.exports = {
  client: undefined,
  api: API,
  ua: UA,
  server: server,
  init: function () {
    client.connect(server)
      .then(function () {
        console.info('connected to gaston - ip:', server.ip, 'port:', server.port)
        gaston.client = client
        require('./listeners')
        require('index.js')
      })
  },
  identify: function (action, file) {
    var ua = gaston.ua
    var id = ua.platform + '-' + ua.device + '-' + ua.browser
    id += '-' + Math.floor(Math.random() * 999)
    var queryString = '?$id=' + id
    queryString += '&$file=' + (file)
    queryString += '&$action=' + action
    window.location.href = window.location.origin + queryString
  }
}

gaston.init()

if (window.mocha) {
  require('gaston-tester')
}
