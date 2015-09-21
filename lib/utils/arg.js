module.exports = function arg (args, index) {
  return Array.prototype.slice.call(args, index)
}
