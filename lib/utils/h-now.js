var pad = require('./pad')

module.exports = function () {
  var date = new Date()
  var dateTime = date.getUTCFullYear()
  '/' +
  pad(date.getUTCMonth() + 1, 2, 0) +
  '/' +
  pad(date.getUTCDate(), 2, 0) +
  ' ' +
  pad(date.getUTCHours(), 2, 0) +
  ':' +
  pad(date.getUTCMinutes(), 2, 0) +
  ':' +
  pad(date.getUTCSeconds(), 2, 0) +
  ' UTC'

  return dateTime
}
