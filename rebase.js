var path = require('path')

module.exports = function (str, base) {
  var re = /(url\()(?:\s*(?!https?:\/\/|data:)((?:[^"'()\\]|\\(?:[^\n0-9a-fA-F]|[0-9a-fA-F]{1,6}\s?))*)\s*|\s*"(?!https?:\/\/|data:)((?:[^"\\\n]|\\(?:[^\n0-9a-fA-F]|[0-9a-fA-F]{1,6}\s?)|\\\n)*)"\s*|\s*'(?!https?:\/\/|data:)((?:[^'\\\n]|\\(?:[^\n0-9a-fA-F]|[0-9a-fA-F]{1,6}\s?)|\\\n)*)'\s*)(\))/gi
  return str.replace(re, function (match, p1, p2, p3, p4, p5, offset, string) {
    var newStr
    if (p2) {
      newStr = p1 + path.join(exports.urlToken(base),p2) + p5
    } else if (p3) {
      newStr = p1 + '"' + path.join(exports.stringToken(base, '"'),p3) + '"' + p5
    } else if (p4) {
      newStr = p1 + "'" + path.join(exports.stringToken(base, "'"),p4) + "'" + p5
    } else {
      newStr = match
    }
    return newStr
  })
}

exports.stringToken = function (str, quote) {
  return exports.escapeChars(str, [quote, '\n'])
}

exports.urlToken = function (str) {
  return exports.escapeChars(str, ["'", '"', "\\(", "\\)", "\\s", "[\\x00-\\x1F]"])
}

exports.escapeChars = function (str, chars) {
  var l = chars.length
    , i
  for (i = 0; i < l; i += 1) {
    str = exports.escapeChar(str, chars[i])
  }
  return str
}

exports.escapeChar = function (str, char) {
  // var re = /(?:(\\(?:[^\n0-9a-fA-F]|[0-9a-fA-F]{1,6}\s?))(")|([^\\])("))/gi

  var la = (char === "\\\\")
      ? "(?!\\\\)"
      : ""
    , re = new RegExp("(?:^(" + char + ")" + la + "|(\\\\(?:[^\\n0-9a-fA-F]|[0-9a-fA-F]{1,6}\\s?))(" + char + ")|([^\\\\])(" + char + "))", "gi")

  return str.replace(re, function (match, p1, p2, p3, p4, p5, offset, string) {
    var newStr
    if (p1) {
      newStr = "\\" + p1
    } else if (p2) {
      newStr = p2 + "\\" + p3
    } else if (p4) {
      newStr = p4 + "\\" + p5
    } else {
      newStr = match
    }
    return newStr
  })
}

