gaston
======

Gaston is your favorite handyman, carriying Vigour's evergrowing set of devtools.

(*note: Vigour currently uses browserify and less. Gaston likes this)

## Commands

```gaston compile``` Compiles all js, less and css files into bundle.js and bundle.css. Gaston keeps watching for changes.

```gaston webserver``` Starts a localhost server on :8080.

### Params

```-port:<portvalue>``` Uses this port for webserver (shorthand: ```-p:<portvalue>```)

```-livereload``` Livereload parameter for webserver

```-debug``` Debug parameter for browserify compile

```-js``` Only compile js

```-less``` / ```-css``` Only compile less and css (except if ```-js``` is also given)


*Mix and match commands and params as you wish:*

```gaston webserver compile -less -js -debug -livereload -p:8080``` Will do all of the above