var log = require('npmlog')
  , npm = require('npm')
  , fs = require('graceful-fs')
  , path = require('path')
  , basePath = process.cwd()
  , pkg = undefined
  // , backtrackFile = require('../lib/utils/backtrack-file');

npm.load(npmInit);

function npmInit(err, npm){
  log.info('gaston', 'running \'npm init\'');
  npm.init(function(){
    pkg = require( path.join(basePath, 'package.json') );
    writeGastonJson();
  });
};

function writeGastonJson(){
  log.info('gaston', 'setting up gaston.json');
}

function exit(){
  log.info('exiting');
  process.exit(0);
};