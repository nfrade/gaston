#Gaston, the new vigour-dev-tools
* all api functions are promises 
* most things like ports , defaults are configurable in the `package.json`
* has a socketserver that is used as a layer to expose node capabilities in a browser or on a different device
* gaston is always exposed as a global if required in js files
* try to handle most diffrences in files between browser/node using browserifies `{ browser: }` pckg option

**vocabulary**

`self` is used to indicate that your talking about your self in the context of multiple clients

---
##sourcemaps
* find a good way to handle sourcemaps especialy challenging for mocha tests and cross client logging

---

##package
* git info parsing

##bundler
* less
* ignore 

---
##build
* bump version
* remove console.logs with transforms
* compresses css 
* uglify js
* accepts native platform later as well (extended in native)

---
##hub
* start
* stop
* dev ( defaults to true )
* view ( sets and retrieves all data )
* scraper ( sets the scraper to use as a data source )
* port (optional)
* get ( get data by path e.g. mtvData.NL.en.shows.0 )

```javascript
tools.hub.start({port:10008})
  .done(function() { 
     //callback 
   })
```

---

##test
* phantomjs
* mocha
* run
  * create combined html (all tests)
  * enviroment and test options

**run**

Run on different test environments and entry points
Later we can add extra test options as well in the native dir
html field for browser sepcifies the html where the folders has to go to
there are differnt types allready specified `common, browser, node`

Now run is only defined as a node api, this has to change just when it runs in a node environment it should do all the fancy cli stuff

-

**travis-ci**

tests should be runnable by node on [travis ci](https://travis-ci.org/)

example .yml
```
language: node_js
node_js:
  - "0.12"
  - "iojs-v1.0.4" 
```
this automaticly spins up node on the machine (we can also try io-js) or multiple versions

then it runs `npm test`

-

**types** 

Specify test-types simple by adding them to the types field
```javascript
tools.test.types.mySpecialPlatform = require('./myspecialplatform')
```

for more info check this [node test type](https://github.com/vigour-io/vigour-dev-tools/blob/master/lib/test/node.js)

When you defined a type you can use it like this,
this will run the testtypes node and mySpecialPlatform on the folder test/common
```javascript
{ specialTests: { 
  dir: 'test/specialTestings',
  type:[ 'node', 'mySpecialPlatform' ]
}, 
```

This
```javascript
{ mySpecialPlatform: { 
  dir: 'test/specialTestings'
}
`defaults` to
```javascript
{ mySpecialPlatform: { 
  dir: 'test/specialTestings',
  type: 'mySpecialPlatform'
}
```


-
when no parameters are passed `defaults`
```javascript
{ common: { 
   dir: 'test/common',
   type:[ 'node', 'browser' ],
   html: 'test/test.html' 
 }, 
 browser: { 
   dir: 'test/browser',
	  html: 'test/test.html' 
	}, 
	node: { dir: 'test/node' }
}
```

-
in this example `both` is run in browser and node
```javascript
tools.test.run({
  node: {
    dir:'test/both'
  },
  browser: {
    dir:'test/both',
    html: 'test/test.html'
  }
})
```

-
also accepts `arrays`
```javascript
tools.test.run({
  node: {
    dir:[ 'test/common', 'test/node' ]
  }
})
```
-
**todo**

change name of `dir` to `path` add option to run on a single file or folder (one test)

---
##web-server
* watcher
  * bundler
* port (optional)
* start
* stop

---
##cli
* connect all other apis to cli 
* ignores promises done callbacks

---
##socket-server
* port (optional, has to be handled client side as well) 
* can be used in node and the browser
* connect all other apis (exposes apis as promises)
* send and facilitates messages from and to clients for tests and debugging
* reset - restarts all connected clients
  * restarts node clients
  * reloads browser clients
*connect - replaces your local gaston with the remote one
  
-
**acts as a browser api shim**

enables you to do stuff like this in the browser
```javascript
 gaston.build().done(function() {
 
 })
 gaston.hub.start()
```
-
**connect**

```javascript
  gaston.socket.connect( 'localhost:10005' )
  //could also become gaston.connect()
```

to revert
```javascript
  gaston.socket.connect( 'self' )
  //swtich back to your local version (gets defaults , first tries package.json then normal defaults)
```

-
**cross-client js exec**
eval is evil but this enables you to do

client jim
```javascript
gaston.socket.id = 'jim'
```

client marcus
```javascript
gaston.socket.id = 'marcus'

//works by stringifiying the function and sending it
gaston.socket.exec('jim', function() {
  app.rotate.val = 20  
})

//supports reg exp
gaston.socket.exec(/jim$/i, function() {
  app.rotate.val = 20  
})

//supports functions
//works by executing the function client side 
gaston.socket.exec(function() { return true }, function() {
  app.rotate.val = 20  
})

//arrays are supported
gaston.socket.exec([ 'self', 'jim' ], function() {
  gaston.log('omg totatly executed')
  app.rotate.val = 20  
})

//execs functions on everyclient
gaston.socket.exec(function() {})

```
use something like node-eval to do stuff on node

-
**on**

```javascript
//listens on all error events
gaston.socket.on('error', function(e) {
 //e has a client and id (client id) field
})

//listens on error events by jim
gaston.socket.on('error','jim',function(){})

//supports arrays
gaston.socket.on('error, ['jim', 'self' ], function(){})

//emit
gaston.socket.id = 'myId'
gaston.socket.emit('error, 'my error')

```

---
##log
Special way of logging hooks into the socket server if available to do multi-client logging

```javascript
gaston.log('lets logs something')
```

```javascript
//only logs self
gaston.log.clients = 'self'

//only log self and 'jim'
gaston.log.clients = [ 'self', 'jim' ]

//also accepts `reg exp`
gaston.log.clients = /$jim/i

//or a `function`
gaston.log.clients = function() {

}
//sets my client id in the output to name, defaults to gaston.socket.id
gaston.log.id = 'jim'
```
-
Outputs logs like this, can also use sourcemap module to show lineinfo
```
jim: 'hey what up'  file: blurgh.js  line: 230:2
```

-
**challenges**
* find out how to do stack traces, the info is available in errors that you log so must be possible to use that, `error.stack`)
* handle sourcemaps manualy (may be nessecary for mocha anyways)

---
##start
* path (optional uses CWD as default)
* by default starts a hub, bundler, watcher, socket-server
* configurable and callbale from node, usefull as entry point for `test.js` for npm test 
* when used in the browser will just try to connect to servers on certain ports etc 
  when you dont use start in a browser file will just asume defaults or `package.json` settings

##Debug

Moving the debug module from [vjs](https://github.com/vigour-io/vigour-js/tree/dev/util/debug) to gaston, or at least most of it e.g.

```
gaston.perf(function() {

})
```
outputs to the gaston.log

* js debugging tools server and client

  
---
##For later
####native
####swarm
####packer-server
####img-server


