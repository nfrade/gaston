var connect = require('gulp-connect');

module.exports = function(rootFolder,port,livereload) {
  connect.server({
    root:rootFolder,
    port:port,
    livereload:livereload
  });
};