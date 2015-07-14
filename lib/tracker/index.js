var log = require('npmlog')
  , keypress = require('keypress');
keypress(process.stdin);


var Tracker = module.exports = {
  init: function(){
    log.info('tracker', 'tracking time for this issue (p to pause or resume)');
    trackSecond();
  }, 
  toggle: function(){
    Tracker.isPaused = !Tracker.isPaused;
    if(Tracker.isPaused){
      log.info('tracker', 'Time Tracking is paused');
    } else {
      log.info('tracker', 'Time Tracking resumed');
      trackSecond();
    }
  }
};

var trackTime = 0;
var trackSecond = function(){
  (function tick(){
    setTimeout(function(){
      if(!Tracker.isPaused){
        trackTime++;
        tick();
      }
    }, 1000);
  })();
};
