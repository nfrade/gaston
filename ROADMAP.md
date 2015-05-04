#Gaston, the new vigour-dev-tools
all api function are promises 

---
##package
* git info parsing

##bundler
* less
* ignore 

---
##build
* bump version
* compresses css 
* uglify js

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

Specefies different test environments and entry points
Later we can add extra test options as well in the native dir
html field for browser sepcifies the html where the folders has to go to
there are differnt types allready specified `common, browser, node`

Now run is only defined as a node api, this has to change just when it runs in a node environment it should do all the fancy cli stuff

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
in this example `both` is run browser and node
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
* ignores promises callbacks

---
####socket-server
* port (optional, has to be handled client side as well) 
* can be used in node and the browser
* connect all other apis (exposes apis as promises)
* send and facilitates messages from and to clients for tests and debugging
* reset - restarts all connected clients
  * restarts node clients
  * reloads browser clients

---
####start
* path (optional uses CWD as default)
* by default starts a hub, bundler, watcher, socket-server
* configurable and callbale from node, usefull as entry point for `test.js` for npm test 

---
##For later
####native
####swarm
####packer-server
####img-server
