gaston
======

Gaston is your favorite handyman, carrying Vigour's evergrowing set of devtools.

(note: Vigour currently uses browserify and less. Gaston likes this. So should you.)

## Installation
Install gaston globally by navigating to the root folder of the repository and doing `npm install -g`

## Commands

`gaston` Starts a server which provides a file browser for the current directory. Clicking on a directory which has an index.html in it builds the project in that directory, watches for changes, and launches the app in the browser. The *Run natively* button creates a cordova project and provides options to support various platforms, and run the project in emulators or natively on physical devices plugged in by USB. This process has many requirements and is somewhat difficult to automate, so you may want to check out the [Native Features Requirements](#user-content-nativeReqs) and  [Troubleshooting](#user-content-troubleshooting) sections.

`gaston compile` Compiles all js, less and css files into bundle.js and bundle.css. Gaston keeps watching for changes.

`gaston webserver` Starts a localhost server on port 8080.

`gaston-release` uglifies (and mangles) bundle.js to build.js, minifies bundle.css to build.css and points to these in the index.html inspired build.html it creates. It also bumps the patch number of the version in package.json and stamps build.js with a timestamp. Needs uglifyjs and cleancss to be installed globally:
`npm install -g uglify-js`, `npm install -g clean-css`

### Params

`-port:<portvalue>` Uses this port for webserver (shorthand: `-p:<portvalue>`)

`-livereload` Livereload parameter for webserver (!TODO)

`-debug` Debug parameter for browserify compile

`-js` Only compile js

`-less` / `-css` Only compile less and css (except if `-js` is also given)

`-nocss` Skips css


*Mix and match commands and params as you wish:*

`gaston webserver compile -less -js -debug -livereload -p:8080` Will do all of the above

## Usage
With gaston, you can require scripts and styles with the same syntax, e.g.
```
var config = require('./config')
require('styles.less')
```

### Known issues
Make sure the styles you require are in the same directory as the file which requires them, otherwise, path rebasing will not work correctly. If the file you want to require is elsewhere, just require a file in the same directory and have that file import the desired file, e.g.

**instead of** `require('dir/styles.less')`

**do this** `require('importer.less')`
and in *importer.less*: `@import 'dir/styles.less';`

<a name="nativeReqs"></a>
## Native Features Requirements
### Setup
You'll need to install the Cordova CLI and its prerequisites (various IDE's and SDK's) by following the instructions from [Apache Cordova's Documentation | The Command-Line Interface](http://cordova.apache.org/docs/en/3.5.0/guide_cli_index.md.html#The%20Command-Line%20Interface). They mention getting a git client. If you're on Windows, I recommend [github's client](https://windows.github.com/); It comes with a git shell from which you can run cordova and it also has a nice configuration wizard which makes authentication really easy (it's usually easy, but on Windows it's somewhat of a pain).

### Additional requirements
#### For iOS
- `sudo npm install -g ios-sim`
- `sudo npm install -g ios-deploy`
- xcode

#### For Windows Phone
- You will need Windows 8 pro (64) to install Visual Studio Express 2013 Update 2, which is needed to install the Windows Phone SDK 8
- To get a Windows Phone emulator running, you need to enable Hyper-V on Windows 8 pro (64). Do this by running (`Win+R`) the `appwiz.cpl` program and selecting *Turn Windows features on or off*. Note that Hyper-V is only available on some Processors. For example, I was unable to enable this feature on the Windows virtual machine running on my iMac.

#### For the Connect SDK
- `sudo gem install cocoapods`

#### Known issues
When building (`cordova build`) or running in an emulator (`cordova emulate`), you may get messages asking to add certain utilities to your path (`android`, `adb`). This did not work for me, so instead, I created symbolic links in `/usr/local/bin`, and this works fine.

```
ln -s /Applications/Android\ Studio.app/sdk/tools/android /usr/local/bin/android
ln -s /Applications/Android\ Studio.app/sdk/platform-tools/adb /usr/local/bin/adb
```

#### Useful links
- [Cordova global configuration (config.xml)](http://cordova.apache.org/docs/en/3.5.0/config_ref_index.md.html)

<a name="createEmulator"></a>
#### Creating an emulator
For Android, an emulator must be created and launched using the Android Virtual Device (AVD) Manager (`android avd`).

Cordova automatically makes the emulators for iOS and Windows Phone 8; for these devices, you don't have to manually create one

<a name="troubleshooting"></a>
## Troubleshooting
### Emulate fails, gaston logs `Error: spawn ENOENT`
This means cordova can't find an emulator for the platform you specified. Either such an emulator doesn't exist (see [Creating an emulator](#user-content-createEmulator)) or cordova can't find an existing emulator. If an android emulator cannot be found, it is most probably due to [this cordova issue](https://issues.apache.org/jira/browse/CB-7257). To solve this problem, make sure the emulator you want to launch your project in is started and unlocked, then, navigate to the *nativeBuildStuff* directory created by gaston and run the following command: `cordova run android --emulator`

### Running on a physical device fails
- Sometimes, unplugging, replugging, and trying again can work
- Sometimes the app is sent to the device but not automatically launched, just tap the icon
- For iOS devices, try running the project found in *nativeBuildStuff/platforms/ios* directly from xcode
- Use `adb devices` to see if an android device is recognized. If not,
    + Log in as a developper
    + Enable ADB / USB debugging (look through settings, [except on Nexus 7](http://stackoverflow.com/questions/18103117/how-to-enable-usb-deb)
    + Unlock screen
    + Plug device in
- Retry with gaston, or navigate to the *nativeBuildStuff* directory created by gaston and run `cordova run <target>`, e.g. `cordova run android` or `cordova run ios` or `cordova run wp8`
Note: `cordova run wp8` launches in an emulator by defult. Force it to launch on a device with `cordova run wp8 --device`

### Code signing error (ios devices)
- Open xcode
- Plug in iOS device
- In xcode, select the device and click 'Use for Development'
- Make sure device is unlocked
- Run app using cordova (`cordova run ios`) or the GUI provided by Gaston
- Follow xcode instructions

Once this is done, the next time you (or Gaston) executes `cordova run ios`, codesign will work even if xcode is closed.

### Getting Emulator logs
#### Android
You can view the logs of android emulators with `adb logcat` ([see documentation for options and filtering](http://developer.android.com/tools/debugging/debugging-log.html)). Th
#### iOS
The iOS emulator has an option to view the logs in Debug > Open System Log...

### Device logs
Use xcode to view ios device logs.
