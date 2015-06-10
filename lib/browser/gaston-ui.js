var Promise = require('bluebird')
  , package = require('package.json');

require('./styles.less');

var ui = module.exports = {
  mainButton: undefined,

  init: function(){
    if( !(package && package.gaston && package.gaston.ui) ){
      return;
    }
    createMainButton();
  }
};

var createMainButton = function(){
  ui.mainButton = document.createElement('div');
  ui.mainButton.classList.add('gaston-ui');
  ui.mainButton.addEventListener('click', function(ev){ console.log('here')
    this.classList.add('open');
  }, false);
  ui.mainButton.innerHTML = modalTemplate;
  document.body.appendChild(ui.mainButton);
}


var modalTemplate = [
  '<div class="content">',
    '<p>',
      '<label for="gaston-server-url">gaston server url:</label>',
      '<input id="gaston-server-url">',
    '</p>',
  '</div>',
  '<div class="logo">G</div>'
].join('\n');