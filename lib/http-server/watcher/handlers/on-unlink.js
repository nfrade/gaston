var onUnlink = module.exports = function onUnlink(Watcher){
  return function onUnlink(file){
    Watcher.removeWatcher(this);
  };
};