var log = require('npmlog')
  , util = require('util')
  , stream = require('stream')
  , vConfig = require('vigour-js/util/config')
  , hNow = require('./h-now')

var Inform = module.exports = function(options) {
  this.fullPkg = ""
  this.branch = options.branch
  stream.Transform.call(this, options);
}

util.inherits(Inform, stream.Transform)

Inform.prototype._transform = function (chunk, enc, cb) {
  this.fullPkg += chunk.toString()
  cb()
};

Inform.prototype._flush = function (err) {
  var parsed;

  try {
    parsed = JSON.parse(this.fullPkg);
    parsed.sha = parsed.version;
    parsed.repository.branch = this.branch;
    if (parsed.repository.branch !== "staging") {
      parsed.version = hNow()
        + " "
        + "(" + parsed.sha + ")"
    }
    if( parsed.vigour ) {
    vConfig.parse(parsed.vigour
      , parsed
      , [{ 'repository.branch': 'branches' }])
    }
    this.push("window.package=" + JSON.stringify(parsed) + ";", 'utf8')
  } catch(err) {
    log.error('cannot parse json file!', err)
    // console.log(this.fullPkg)
  }
};

