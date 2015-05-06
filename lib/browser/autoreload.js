
var autoreload = module.exports = function(){
  window.location.reload();
}

gaston.on('reload', function(){
  autoreload();
});

