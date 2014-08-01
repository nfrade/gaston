window.onload = function () {
  var natifyButtons = document.getElementsByClassName('natify')
    , i = natifyButtons.length - 1
  for (; i >= 0; i -= 1) {
    natifyButtons[i].addEventListener('click', function (event) {
      var natifyButton = event.target;
      enableNative(natifyButton)
    })
  }
}

function goTo (val) {
	location.href = val
}

function ajaxError (error) {
	console.error('Ajax error: ', error)
  alert("Gaston: An Ajax request failed. Check the javascript console for details.")
}

function failure (data) {
  console.log(data)
  alert("Gaston: Something failed. Check the javascript console for details.")
}

function enableNative (button) {
  var gastonUrl = document.getElementById('gastonUrl').value
   , path = button.getElementsByClassName('natifyTargetPath')[0].value
	ajaxModule.ajax({
		url: gastonUrl
		, data: {
			action: 'enable'
			, path: path
		}
		, complete: function (data) {
			if (data.msg === 'success') {
        showPlatformsDialog(path, button)
      } else if (data.msg === 'pleaseCreate') {
        showCreateDialog(path, button)
      } else {
        failure(data)
      }
		}
		, error: ajaxError
	})
}

function showCreateDialog (path, button) {
  var modelDialog = document.getElementById('nativeCreateDialog')
    , dialog = modelDialog.cloneNode(true)
    , targetDir = dialog.getElementsByClassName('targetDirectory')[0]
  targetDir.innerHTML = path
  dialog.getElementsByClassName('cancelButton')[0].addEventListener('click', function (event) {
    var parent = dialog.parentNode
      , removed = parent.removeChild(dialog)
    removed = null
    button.style.display = 'block'
  })
  dialog.getElementsByClassName('submitButton')[0].addEventListener('click', function (event) {
    submitCreateNative(path, button, dialog)
  })
  button.parentNode.insertBefore(dialog, button)
  dialog.style.display = 'block'
  button.style.display = 'none'
}

function submitCreateNative (path, button, dialog) {
  var gastonUrl = document.getElementById('gastonUrl').value
  ajaxModule.ajax({
    url: gastonUrl
    , data: {
      action: 'create'
      , path: path
      , rdsid: dialog.getElementsByClassName('rdsid')[0].value
      , displayName: dialog.getElementsByClassName('displayName')[0].value
    }
    , complete: function (data) {
      if (data.msg === 'success') {
        showPlatformsDialog(path, button, dialog)
      } else {
        failure(data)
      }
    }
    , error: ajaxError
  })
}

function showPlatformsDialog (path, button, createDialog) {
  var gastonUrl = document.getElementById('gastonUrl').value
  ajaxModule.ajax({
    url: gastonUrl
    , data: {
      action: 'getPlatforms'
      , path: path
    }
    , complete: function (data) {
      var modelDialog
        , dialog
        , parent
        , removed
        , platforms
        , i
      if (data.msg === 'success') {
        modelDialog = document.querySelector('#installPlatformsDialog')
        dialog = modelDialog.cloneNode(true)
        platforms = dialog.querySelector('.platformSelection').querySelectorAll('input')
        for (i = platforms.length - 1; i >= 0; i -= 1) {
          console.log('in installed', !!~data.platforms.installed.indexOf(platforms[i].value))
          console.log('in available', !!~data.platforms.available.indexOf(platforms[i].value))
          if (!(~data.platforms.installed.indexOf(platforms[i].value) || ~data.platforms.available.indexOf(platforms[i].value))) {
            platforms[i].disabled = true
            platforms[i].parentNode.style.fontStyle = 'italic'
            platforms[i].parentNode.style.color = '#888'
          }
        }
        dialog.getElementsByClassName('cancelButton')[0].addEventListener('click', function (event) {
          var parent = dialog.parentNode
            , removed
          button.style.display = 'block'
          removed = parent.removeChild(dialog)
          delete removed
        })
        dialog.getElementsByClassName('emulateButton')[0].addEventListener('click', function (event) {
          run(path, platforms, 'emulate')
        })
        dialog.getElementsByClassName('runButton')[0].addEventListener('click', function (event) {
          run(path, platforms, 'run')
        })
        dialog.style.display = 'block'
        parent = button.parentNode
        if (createDialog) {
          removed = parent.removeChild(createDialog)
          delete removed
        }
        parent.insertBefore(dialog, button)
        button.style.display = 'none'
      } else {
        failure(data)
      }
    }
    , error: ajaxError
  })
}

function run (path, platforms, action) {
  var gastonUrl = document.getElementById('gastonUrl').value
    , selectedPlatforms = createPlatformsList(platforms)
  if (selectedPlatforms.length > 0) {
    ajaxModule.ajax({
      url: gastonUrl
      , data: {
        action: action
        , path: path
        , platforms: selectedPlatforms
      }
      , complete: function (data) {
        if (data.msg === 'success') {
          // TODO
        } else {
          failure(data)
        }
      }
      , error: ajaxError
    })
  } else {
    pleaseSelectPlatforms()
  }
}

function createPlatformsList (platforms) {
  var i = platforms.length - 1
    , list = []
  for (; i >= 0; i -= 1) {
    if (platforms[i].checked) {
      list.push(platforms[i].value)
    }
  }
  return list
}

function pleaseSelectPlatforms () {
  alert('Gaston: Please select one or many platforms and try again')
}

function submitInstallPlatforms () {
	var path = document.getElementById('installPlatformsTargetDir').value
		, checkboxes = document.getElementById('platformSelection').querySelectorAll('input')
		, i = checkboxes.length - 1
		, selectedPlatforms = []
    , gastonUrl = document.getElementById('gastonUrl').value
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
        if (data.msg === 'success') {
  				hideInstallPlatformsDialog()
  				enableNative(path)
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