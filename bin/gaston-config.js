var fs = require('fs');
var child_process = require('child_process');
var spawn = child_process.spawn;




function openEditor(file) {
  var cp = spawn(process.env.EDITOR, [file], {
    customFds: [
      process.stdin,
      process.stdout,
      process.stderr
    ]
  });
  cp.on('exit', function() {
    console.log('editor ended');
    var content = fs.readFileSync(file, 'utf8');
    console.log(content);
  });

}
