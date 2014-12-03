#!/usr/bin/env bash

function optimizejs {
	uglifyjs bundle.js -m > build.js
	echo "bundle.js optimized -> build.js"
}

if [ -e build.js ];
then
	read -p "build.js already exists. Replace? [y/n] (don't press ENTER) " -n 1 -r
	echo
	if [[ $REPLY =~ ^[Yy]$ ]]
	then
	    optimizejs
	fi
else
	if [ -e bundle.js ];
	then
		optimizejs
	else
		echo "Can't find bundle.js"
	fi
fi

function optimizecss {
	cleancss -o build.css bundle.css
	echo "bundle.css optimized -> build.css"
}

if [ -e build.css ];
then
	read -p "build.css already exists. Replace? [y/n] (don't press ENTER) " -n 1 -r
	echo
	if [[ $REPLY =~ ^[Yy]$ ]]
	then
	    optimizecss
	fi
else
	if [ -e bundle.css ];
	then
		optimizecss
	else
		echo "Can't find bundle.css"
	fi
fi
