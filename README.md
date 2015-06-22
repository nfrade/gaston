# Gaston - the ultimate dev tool - by vigour.io

### what is it?
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

###### existing project:
- you can always follow the steps described for a new project - all the actions are not intrusive (no file is created if it already exists and gaston config is only added if not present in package.json)  
- To run Gaston for a project, the project should have:
 - a git repository
 - a package.json file, with a "gaston" section
 - index.html + index.js + styles.less in the same path


