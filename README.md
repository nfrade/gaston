# Gaston - the ultimate dev tool - by vigour.io

### index
[what is it?](#what-is-it)  
[installing Gaston](#installing)  
[quick start](#quick-start)  
[project requirements](#requirements)  
[Gaston configuration](#configuration)

### <a name="what-is-it"></a>what is it?
- Gaston is meant to replace grunt or gulp for running projects when developing
- It will save anyone a lot of time and effort with configuration for every project
- you can run multiple instances on multiple projects, and not worry about clashing ports
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

### <a name="installing"></a> installing:
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

### <a name="quick-start"></a> quick start:
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

###### existing project:
- you can always follow the steps described for a new project - all the actions are not intrusive (no file is created if it already exists and gaston config is only added if not present in package.json)  
- ### <a name="requirements"></a>To run Gaston for a project, the project should have:
 - a git repository
 - a package.json file, with a "gaston" section
 - index.html + index.js + styles.less in the same path
 - **Vigour.io specific**: 
  - install *vigour-js* as a dependency for your project
  - make sure `vigour-js/util/inform-transform` exists in the branch you're using for *vigour-js*
  - add the following property to *package.json["gaston"]*:
```json
"gaston": {
  "browserify-transforms": [
   {
    "path": "vigour-js/util/inform-transform",
    "options": {
      "global": "false"
    }
  }
 ],
}
```
- run it
- from now on, you can run gaston anytime just by
```shell
$ gaston
```
- fire up a browser tab
```shell
> launch
```
- start developing
every time you save a file(js, json, less, css, index.html) the browser reloads with the recompiled changes

### <a name="configuration"></a> configuration:
Gaston exists to make your life easy so it comes ready to use out of the box. However, it also gives you a lot of freedom to do things your way.  
Here's how a default config looks like, in your project's package.json:
```json
{
 "gaston": {
   "port": 8080,
   "socket-port": 9000,
   "no-auto-reload": false,
   "no-package": false,
   "bundle": "./",
   "build": "./",
   "compilers": {
     "js": "browserify",
     "css": "less"
   },
   "smaps": true,
   "remote-logging": //not implemented yet
   "require-paths": {
   }
 }
}
```
**port** - http server port  
**socket-port** - websocket server port  
*(if you run multiple instances, the ports will be incremented by 1 for each new instance)*  
**no-auto-reload** - if true, browsers won't auto-reload after recompiling  
**no-package** - if false, you will be able to `require('package.json')` in your app  
**bundle** relative path where bundle.js and bundle.css will be compiled to, relative to index.html  
**build** relative path where build.js and build.css will be compiled to, relative to index.html  
**compilers**  
 **js** browserify is, for now, the only compiler for javascript  
 **css** "less is, for now, the only compiler for less"  
**smaps** if set to true, smaps will replace the standard source-maps (give it a go)  
**remote-logging** this will allow you to receive all the consoles from other devices on your browser console  
*(should be used with smaps, for awesome magic)*
