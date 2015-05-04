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
* port
* get ( get data by path e.g. mtvData.NL.en.shows.0 )

---

####test
* phantomjs
* mocha

---
####web-server
* watcher
  * bundler

---
####cli
* connect all other apis to cli 

---
####socket-server
* can be used in node and the browser
* connect all other apis (exposes apis as promises)
* send and facilitates messages from and to clients for tests and debugging
* reset - restarts all connected clients
  * restarts node clients
  * reloads browser clients

---
##For later
####native
####swarm
####packer-server
####img-server
