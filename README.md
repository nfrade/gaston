![image](https://travis-ci.org/vigour-io/gaston.svg?branch=develop)

# Gaston - the ultimate dev tool - by vigour.io

### index
- [what is it?](#what-is-it)  
- [installing Gaston](#installing)  
- [quick start](#quick-start)  
- [testing with gaston](#testing)  
- [project requirements](#requirements)  
- [Gaston configuration](#configuration)
 - [options](#configuration-options)
- [remote-logging](#remote-logging)

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

### <a name="testing"></a> testing with gaston:
Gaston takes care of all your testing needs - if you're using mocha and chai.  
You can run tests in the browser, or in the command line, without the need of requiring mocha or chai anywhere.
##### How does it work?
First, you need to add a `test` dir to your project and make it look something like:
```
- root
 - test
  - browser # all the tests to be run in the browser (or phantomjs)
  - node    # all the server-side tests that don't require a browser
  - common  # tests that need to be run through node and in a browser
```
any of the sub-directories are optional, depends on what and how you want to test it.   
Inside each folder, you can have any structure you want, and every .js file will only need to have the test code itself:
```
#some-component.js
describe('some component', function(){
 it('should do some stuff', function(){ 
  expect(something).to.be.null;
  assert.equal(1,2);
 });
});
```
###### testing while developing:
just run `gaston test` from the terminal and press `l` to launch a browser window.
this will work exactly like running `gaston dev` but will include all the mocha and chai stuff you need to run the tests. So you can run two gaston instances, one for developing and one for testing at the same time and be sure that the tests are passing while you add new features or correct bugs. You don't even need to have the tab with the tests open because the favicon will turn from a green tick to a red cross if any test fails.  
###### CI tests
you can choose the way you run CI tests:
* `gaston tests browser` - this will run all the tests that need a browser in phantomjs, in `test/browser/`.
* `gaston tests node` - this will run all the tests without a browser, in `test/node/`.
* `gaston tests common` - this will run all the tests in `test/common` once in node mode and then in browser mode.
* `gaston tests` will default to browser mode
You can integrate this with any CI tool, because the exit code will be 0 if all tests pass or an error code if any test fails.


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
   "remote-logging": true,
   "require-paths": {
   }
 }
}
```
#### <a name="configuration-options"></a>Options  
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
**remote-logging** this will allow you to receive all the consoles from other devices on your browser console  
*(if set to true, smaps will replace the standard source-maps - give it a go!)*
*(should be used with smaps, for awesome magic)*

#### <a name="remote-logging"></a>Remote Logging
Gaston is meant to help you develop in a multi-device environment. As such, remote logging is here so you can see all the logs, infos, warns, debugs and errors from other devices(be it other desktop or mobile browsers or native builds for mobile, tv, set-top boxes, chromecasts, etc... ) running the same url. It uses our own [smaps](#smaps) to let you see where the error stack traces or where in the code the logs originated. It works as follows:
- every device is assigned a GastonID which is composed by `<platform>-<device>-<browser>-<random_number>`
 - examples: mac-desktop-chrome-674, ios-phone-safari-123, samsung-tablet-chrome-789
- this id is attached to the query string, so in native builds or mobiles it is difficult to check that id.
 - you may run `gaston.identify()` in the browser console, and all connected devices will show their own id
- first time you start the browser, you're only listening to that same browser window
- to start listening to one device:
 - `gaston.listen('ios')` - this will turn on listening to all ios devices
 - `gaston.listen('ios', 'chrome')` - this will turn on listening to all ios devices running chrome
 - `gaston.listen('ios', 'tablet')` - this will listen to all tablets running ios
 - `gaston.listen('123')` - this will listen to the device with id ending in 123
 - any combination can be used here, to filter the devices you wish
- to stop listening to a device:
 - use `gaston.unlisten(arguments)` using the same approach as with gaston.listen
- you can also turn on and off your own console, running `gaston.unlisten('self')` or `gaston.listen('self')`
- you can always check which filters are being applied by running `gaston.config.verbal`
