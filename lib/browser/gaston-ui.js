// require('./styles.less');

var Promise = require('bluebird')
  , package = require('package.json');

var ui = module.exports = {
  mainButton: undefined,

  init: function(){ console.log('here')
    createMainButton();
  }
};

var createMainButton = function(){
  ui.mainButton = document.createElement('div');
  ui.mainButton.classList.add('gaston-ui');
  var style = 'background-color:black;color:white;display:inline-block;font-size:5.2em;';
  ui.mainButton.setAttribute('style', style);
  ui.mainButton.innerHTML = modalTemplate;
  document.body.appendChild(ui.mainButton);
  ui.controls = document.getElementById('gaston-ui-controls');
  ui.logo = document.getElementById('gaston-ui-logo');
  ui.loadButton = document.getElementById('gaston-load-button');
  ui.serverUrl = document.getElementById('gaston-new-url');
  
  ui.logo.addEventListener('click', function(ev){
    var display = ui.controls.style.display;console.log('here', display)
    ui.controls.style.display = (display !== 'block'? 'block' : 'none');
    return false;
  }, false);

  ui.loadButton.addEventListener('click', function(ev){
    var url = ui.serverUrl.value;
    if(!url){
      return;
    }
    if( !url.startsWith('http') ){
      url = 'http://' + url;
    }
    window.location.href = url;
  })
};



var modalTemplate = [
  '<div class="content">',
    '<p id="gaston-ui-controls" style="display: none;">',
      '<label for="gaston-new-url">new url:</label>',
      '<input id="gaston-new-url">',
      '<button id="gaston-load-button">go</button>',
    '</p>',
  '</div>',
  '<div id="gaston-ui-logo">G</div>'
].join('\n');