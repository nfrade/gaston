function goTo (val) {
	location.href = val
}

function ajaxError (error) {
	console.error("Faya: ", error)
}

function failure (data) {
  console.log(data)
  alert("Gaston: I've failed you, but it's probably your fault. Check the javascript console for details.")
}

function buildNative (path) {
  var gastonUrl = document.getElementById("gastonUrl").value
	ajaxModule.ajax({
		url: gastonUrl
		, data: {
			action: "populate"
			, path: path
		}
		, complete: function (data) {
			if (data.msg === "pleaseCreate") createNativeDialog(path)
			else if (data.msg === "pleaseInstallPlatforms") {
				installPlatformsDialog(path, data.availablePlatforms)
			}
			else if (data.msg === "success") {
				console.log("Success!")
			} else {
				failure(data)
			}
		}
		, error: ajaxError
	})
}

function installPlatformsDialog (path, availablePlatforms) {
	var targetDir = document.getElementById('installPlatformsTargetDir')
		, dialog = document.getElementById("installPlatformsDialog")
		, i = availablePlatforms.length - 1
		, platformSelection = document.getElementById("platformSelection")
		, newHTML = ""
	targetDir.value = path
	for (; i >= 0; i -= 1) {
		newHTML += '<label>' + availablePlatforms[i] + '</label><input type="checkbox" value="' + availablePlatforms[i] + '">'
	}
	platformSelection.innerHTML = newHTML
	dialog.style.display = "block"
}

function createNativeDialog (path) {
	var targetDir = document.getElementById("targetDir")
		, dialog = document.getElementById("nativeCreateDialog")
	targetDir.innerHTML = path
	dialog.style.display = "block"
}

function hideCreateNativeDialog () {
	document.getElementById('nativeCreateDialog').style.display = "none"
}

function hideInstallPlatformsDialog () {
	document.getElementById('installPlatformsDialog').style.display = "none"
}

function cancelCreateNative () {
	hideCreateNativeDialog()
}

function cancelInstallPlatforms () {
	hideInstallPlatformsDialog()
}

function submitCreateNative () {
	var path = document.getElementById("targetDir").innerHTML
    , gastonUrl = document.getElementById("gastonUrl").value
	ajaxModule.ajax({
		url: gastonUrl
		, data: {
			action: "create"
			, path: path
			, rdsid: document.getElementById('rdsid').value
			, displayName: document.getElementById('displayName').value
		}
		, complete: function (data) {
			if (data.msg === "success") {
				hideCreateNativeDialog()
				buildNative(path)
			}
		}
		, error: ajaxError
	})
}

function submitInstallPlatforms () {
	var path = document.getElementById('installPlatformsTargetDir').value
		, checkboxes = document.getElementById('platformSelection').querySelectorAll("input")
		, i = checkboxes.length - 1
		, selectedPlatforms = []
    , gastonUrl = document.getElementById("gastonUrl").value
	for (; i >= 0; i -= 1) {
		if (checkboxes[i].checked) {
			selectedPlatforms.push(checkboxes[i].value)
		}
	}
	if (selectedPlatforms.length > 0) {
		ajaxModule.ajax({
			url: gastonUrl
			, data: {
				action: 'installPlatforms'
				, path: path
				, selectedPlatforms: selectedPlatforms
			}
			, complete: function (data) {
        if (data.msg === "success") {
  				hideInstallPlatformsDialog()
  				buildNative(path)
        } else {
          failure(data)
        }
			}
			, error: ajaxError
    })
	}
}

// TODO Require this rather than copy paste (see `vigour-js/browser/network/ajax.js`)

/*!
 * @license Copyright (c) 2012-2014, Vigour. All rights reserved.
 * @author: Jim de Beer, jim@vigour.io
 */
var _a = 'addEventListener';

/**
 * xhr wrapper, adds some nice extras such as multiple requests to a single api call
 * xhr wrapper will include jsonp in a later stage
 * @method extend
 * @param   {String|Array} params.url         Specifiy the url, array fetches multiple url's
 * @param   {String}   [params.api]           Repeat this string for the url that needs to be called
 * @param   {Function} [params.complete]      Specify a callback when an array is passed to url complete is called when all items are complete
 * @param   {Function} [params.error]         On error callback
 * @param   {Function} [params.change]        Function called on xhr.onreadystatechange
 * @param   {Boolean}  [params.async]         If set to false will call an syncronous request (not recommended!)
 * @param   {String}   [params.user]          User parameter
 * @param   {String}   [params.pass]          Password parameter
 * @param   {Boolean}  [params.parse]         If set to false will not try to parse response to JSON
 * @param   {String}   [params.type|.method]  POST or GET, default is get;
 * @param   {String}   [params.contentType]   request content type default id "application/x-www-form-urlencoded"
 * @param   {String}   [params.mime]          defines mime type
 * @param   {Function} [params.progress]      Progress callback
 * @param   {Object}   [params.header]        Sets request headers
 * @param   {*}        [params.data]          Pass data to the request, defaults to ? on get;
 */
 var ajaxModule = {}
ajaxModule.ajax = function(params, urlset) {
  var _url = params.url;
  if (!urlset && _url instanceof Array) {
    params.m = function() {
      if ((++params.r) === params.n) {
        for (var i = 0, arr = [], l = _url.length; i < l; arr.push(params.d[_url[i++]]));
        params.complete(arr);
      }
    };
    params.r = 0;
    params.d = {};
    for (var i = 0, l = params.n = _url.length; i < l; module.exports(params, _url[i++]));
  } else {
    var data = params.data,
      url = (params.api || '') + (urlset || _url),
      headers = params.headers,
      success = params.complete,
      progress = params.progress,
      error = params.error,
      change = params.change,
      mime = params.mime,
      user = params.user,
      pass = params.pass,
      parse = params.parse,
      reqdata = null,
      method = params.type || params.method || 'GET',
      contentType = params.contentType || 'application/x-www-form-urlencoded',
      async = (params.async === false) ? false : true,
      xhr = new XMLHttpRequest(),
      _encode = this.encode;
    // ------------------------------------------------------------ DATA
    if (data) {
      if (method === 'GET') {
        url += '?' + _encode(data, 'GET');
      } else {
        reqdata = _encode(data, 'POST');
      }
    }
    // ------------------------------------------------------------ METHOD, URL, ASYNC, USER & PASS
    xhr.open(method, url, async, user, pass);
    // ------------------------------------------------------------ HEADERS
    xhr.setRequestHeader('content-type', contentType);
    if (headers) {
      for (var f in headers) {
        xhr.setRequestHeader(f, headers[f]);
      }
    }
    // ------------------------------------------------------------ EVENTS
    if (success) {
      xhr[_a]("load", function(e) {
        var resp = (e.target || e.srcElement).response;
        if (parse !== false) {
          try {
            resp = JSON.parse(resp);
          } catch (e) {}
        }
        if (params.m) {
          params.d[urlset] = resp;
          params.m();
        } else {
          success(resp, e);
        }
      }, false);
    }
    if (error) {
      xhr[_a]("error", error, false);
    }
    if (progress) {
      xhr[_a]("progress", progress, false);
    }
    if (change) {
      xhr.onreadystatechange = change;
    }
    // ------------------------------------------------------------ MIME
    if (mime) {
      xhr.overrideMimeType(mime);
    }
    // ------------------------------------------------------------ SEND
    xhr.send(reqdata);
  }
};

ajaxModule.encode = function(data, method) {
  var result = '';
  if (data instanceof Object) {
    if (data instanceof FormData && method != 'GET') {
      result = data;
    } else if (data instanceof Array) {
      result = JSON.stringify(data[f]);
    } else {
      for (var f in data) {
        result += f + '=' + ((data[f] instanceof Object) ? JSON.stringify(data[f]) : data[f]) + '&';
      }
      result = result.slice(0, -1);
    }
  } else {
    result = data;
  }
  return result;
};