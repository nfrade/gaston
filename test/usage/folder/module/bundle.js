window.package={"name":"my project","version":"2015/03/12 21:10:39 UTC (1.1.16)","repository":{"branch":"master"},"vigour":{"x":"y"},"sha":"1.1.16"};(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/marcus/dev/gaston/test/usage/folder/module/index.js":[function(require,module,exports){

var things = require('./things')




document.write('testing it success!')
},{"./things":"/Users/marcus/dev/gaston/test/usage/folder/module/things.js"}],"/Users/marcus/dev/gaston/test/usage/folder/module/things.js":[function(require,module,exports){
console.log('things...')
},{}]},{},["/Users/marcus/dev/gaston/test/usage/folder/module/index.js"]);
