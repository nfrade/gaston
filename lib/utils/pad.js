var pad = module.exports = function pad(val, size, filler){
  filler = filler || ' ';
  var s = val+"";
  while (s.length < size) s = filler + s;
  return s;
};