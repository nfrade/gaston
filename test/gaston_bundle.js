var gaston = require('../gaston.js')
  , entry = '/Users/shawn/Work/mtv-play/index.js'
console.log('ENTRY', entry, process.cwd())
gaston.bundle(entry
  , {
    branch: 'staging'
  }
  , function (err) {
    if (err) {
      console.error('Error bundling index.js', err)
    } else {
      console.log("SUCCESS")
    }
  })