# Gaston - the ultimate dev tool - by vigour.io

### what is it?
- Gaston is meant to replace grunt or gulp for running projects when developing
- It will save anyone a lot of time and effort with configuration for every project
- it also produces build artifacts but you can still use your favourite task runner to make more personalized builds
 - soon, you will be able to configure much more, which will allow you to depend on it for everything
- if you use **browserify** for common-js modules and **less** for css compiling you should start using it right away
 - allows for proper use of `require('./styles.less');` 
 - a sass plugin will also be available in the near future
 - you can easily use any existing browserify transforms or make your own so you can keep working how you're used to
- it runs an http server, that:
 - serves a directory-index of your project, and if you access a folder containing an application (index.html + index.js):
 - it compiles and serves the application
 - it runs a watcher for every file (js, json or css related), so when any one changes:
 - it recompiles everything (super-fast) and reloads any browser that is running the same application
- your development flow will become even more agile (not that kind, no scrum here)
- source-maps for javascript working out of the box
 - no source-maps for css, but we advocate a component approach so you always know which source file to edit
 - there's also something called <a href="#smaps">**smaps**</a> that we're developing here, which brings some magic to the way we work with source mapping, and might replace that overhead completely.


### installing
```shell
# you can install from npm, and use the stable branch master:
$ npm install -g gaston

# or you can keep up with the latest cool features (branch dev):
$ git clone git@github.com:vigour-io/gaston.git
$ cd gaston
$ git checkout dev
# you can install it globally
$ npm link
```

### quick start:
Gaston can be used with new or existing projects
###### new project:
- go to the directory where you want to run the project, for example:
```shell
$ mkdir my-project
$ cd my-project
```
- make it a gaston project 
```shell
$ gaston init
```
now you have a package.json with gaston default configuration and a git repository you can work on
- create application files - index.html + index.js + styles.less
this can be done in the root of the project or in any subfolder; this way you can have many apps running inside each project.
```shell
$ gaston bootstrap
```
- run Gaston
```shell
$ gaston
```
fire up a browser tab
```shell
> launch
```

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
