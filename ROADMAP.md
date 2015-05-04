##Gaston, the new vigour-dev-tools

####package
* git info parsing

####bundler
* less
* ignore 

---
####build
* bump version
* compresses css 
* uglify js

---
####hub
* start
* stop
* view ( sets and retrieves all data )
* scraper ( sets the scraper to use as a data source )
* port (optional)
* get ( get data by path e.g. mtvData.NL.en.shows.0 )

---

####test
* phantomjs
* mocha

---
####web-server
* watcher
  * bundler
* port (optional)
* start
* stop

---
####cli
* connect all other apis to cli 

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


---
##For later
####native
####swarm
####packer-server
####img-server
