# Gaston - the ultimate dev tool - by vigour.io

##### Installing
```shell
# you can install from npm, and use the stable branch master:
$ npm install -g gaston

# or you can keep up with the latest cool features (branch dev):
$ git clone git@github.com:vigour-io/gaston.git
$ cd gaston
$ git checkout dev
# you can install it globally
$ npm link
# or run it locally
$ npm install
$ 
```
##### Usage
```shell
# go to any folder, for example:
$ cd development/vigour-js
# run it
$ gaston // alias for gaston dev
# if you are running a local copy:
$ ../path/to/gaston/bin/gaston
```
now you can fire up a browser window and open:
http://localhost:8080

#### Features ready
* run gaston from any path and you'll get a webserver
* directory index navigation
* serves static files
* opening an .html file will 
  * render the page
  * run separate watchers for js and less files
  
#### Roadmap
* set up browserify and less compilation
* start adding params to configure options
* create javascript API so it can be used as a module


#### Some notes
###### Convention over Configuration
Let's not try to get too religious, but there are things that simply work better if we agree upon them;
This will allow us to get rid of overhead such like the require('style.less') and the hacking we need to add to browserify.

* CSS - Less will compile from the file style.less to bundle.css
  * style.less can have @imports to files in styles dir, to make it more modular
  * it can also have Less code in the file
  * production build will generate bundle.min.css
* JS - Browserify will compile from the file index.js to bundle.js
  * index.js is the entry point
  * can contain all the logic or be split into smaller modules
  * production build will generate bundle.min.js
