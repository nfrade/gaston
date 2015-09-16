var onChange = module.exports = function onChange(Watcher){
  return function onChange(file){
    console.log(file, 'has changed');
  };
};