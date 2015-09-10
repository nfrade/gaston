var hNow = module.exports = function () {
  var date = new Date()
    , dateTime = date.getUTCFullYear()
      + "/"
      + pad(date.getUTCMonth() + 1, 2)
      + "/"
      + pad(date.getUTCDate(), 2)
      + " "
      + pad(date.getUTCHours(), 2)
      + ":"
      + pad(date.getUTCMinutes(), 2)
      + ":"
      + pad(date.getUTCSeconds(), 2)
      + " UTC";

  return dateTime;
}

function pad (val, nbDigits) {
  var missing = nbDigits - val.toString().length
  while (missing > 0) {
    val = "0" + val
    missing -= 1
  }
  return val
}