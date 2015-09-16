require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/constructor.js":[function(require,module,exports){
"use strict";

var Base = require('./')

exports.setParent = function( val, event, parent, key ) {
  if( parent ) {
    this._$parent = parent
  } else if( this._$parent ) {
    this._$parent = null
  }
  if( key !== void 0 ) {
    this.$key = key
  }
}

exports.$ChildConstructor = Base

exports.$generateConstructor = function() {
  return (function derivedBase() {
    this.$clearContext()
    Base.apply( this, arguments )
  })
}

exports.$Constructor = {
  set:function( val ) {
    this._$Constructor = val
  },
  get:function() {
    if( !this.hasOwnProperty( '_$Constructor' ) ) {
      for( var key$ in this ) {
        if( key$[0]!=='_' && !this['_'+key$] ) {
          this.$createContextGetter.call( this, key$ )
        }
      }
      this._$Constructor = this.$generateConstructor()
      this._$Constructor.prototype = this
    }
    return this._$Constructor
  }
}

},{"./":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/index.js"}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/context/index.js":[function(require,module,exports){
"use strict";
var Base = require('../index.js')
var define = Object.defineProperty

/**
 * @function $createContextGetter
 * @memberOf Base#
 * @param  {string} key Key to create the context getter for
 */
exports.$createContextGetter = function( key, value ) {
  if(!value) {
    value = this[key]
  }
  if( value && value.$createContextGetter ) {
    var privateKey = '_'+key
    this[privateKey] = value
    for( var val_key in value ) {
      if( val_key[0] !== '_' && !value['_'+val_key] ) {
        value.$createContextGetter( val_key )
      }
    }
    define( this, key, {
      get: function(){
        var value = this[privateKey]
        if( value instanceof Base ) {
          if( !this.hasOwnProperty( privateKey ) ) {
            value._$context = this
            value._$contextLevel =  1
          } else if( this._$context ) {
            value._$contextLevel = this._$contextLevel + 1
            value._$context = this._$context
          } else {
            value.$clearContext()
          }
        }
        return value
      },
      set: function( val ) {
        this[privateKey] = val
      },
      configurable:true
    })
  }
}

exports.$resolveContextSet = function( val, event, context, alwaysreturn ) {


  if(event) {
    event.$resolving = this
  }

  //this one is still wrong...
  //---------
  var i = this._$contextLevel
  var context = context || this._$context
  // var prevcontext

  if(context._$context) {
    //double contexts!!!
    // this._$contextLevel = i + context._$contextLevel
    // context = context._$context
    //fixes the path but nothing more
    context = context.$resolveContextSet( {}, event, context._$context, true )
    // prevcontext = context

    // console.log(prevcontext === context )

  }

  var iterator = this
  var path = []
  while( i ) {
    // console.log(iterator, iterator.$key)
    var key = iterator.$key
    path.unshift( key )
    iterator = iterator._$parent
    i--
  }

  //resolve double contexts!!!!

  var resolveEventOrigin = event && event.$origin === this && event.$context === context
  var pathLength = path.length
  var pathLengthCompare = pathLength - 1

  if(event) {
    event.$block = true
  }

  var dontReturn
  var prevContext

  for( i = 0; i < pathLength; i++ ) {
    if(context) {
      context.$clearContext()

      prevContext = context

      // console.error('resolve???', pathLength, path, i, this._$path, 'val:',val )

      context = context.$setKeyInternal( path[i],
      i === pathLengthCompare ? val : {},
      context[path[i]],
      event, //false, //event, //so weird!
      true )

      if(!context && alwaysreturn ) {
        context = prevContext[path[i]]
      }
    }
  }
  // context.$clearContextUp()

  if(event) {
    event.$block = null
  }

  if (resolveEventOrigin) {
    event.$context = null
    event.$origin = context
  }

  return context
}

/**
 * Parent of base object
 * @name  $parent
 * @memberOf Base#
 * @type {base}
 */
exports.$parent = {
  get:function() {
    if(this._$contextLevel) {
      if(this._$contextLevel === 1) {
        return this._$context
      } else if(this._$contextLevel) {
        if(this._$parent && !this._$parent._$context !== this._$context ) {
          /*
            this is where it fails
          */
          // console.log('!@#!@#!@#?')
          this._$parent._$context = this._$context
          this._$parent._$contextLevel = this._$contextLevel-1
          return this._$parent
        } else {
          return this._$parent
        }
      }
    } else {
      if(this._$parent && this._$parent._$context) {
        // console.log('!@#!@#!@#?xxxx')

        this._$parent.$clearContext()
      }
      return this._$parent
    }
  },
  set:function( val ) {
    //TODO: wrong needs to call update parent etc
    this._$parent = val
  }
}

//TODO: share more here! (but smart)
//TODO: perf tests (reverse at the end perhaps faster?)
exports.$path = {
  get:function() {
    var path = []
    var parent = this
    while( parent && parent.$key !== void 0 ) {
      path.unshift( parent.$key )
      parent = parent.$parent
    }
    return path
  }
}

exports._$path = {
  get:function() {
    var path = []
    var parent = this
    while( parent && parent.$key !== void 0 ) {
      path.unshift( parent.$key )
      parent = parent._$parent
    }
    return path
  }
}

},{"../index.js":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/index.js"}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/context/util.js":[function(require,module,exports){
"use strict";

exports.$clearContextUp = function( level ) {
  var parent = this
  var i = 0
  while( parent && (!level||i<level) ) {
    i++
    parent.$clearContext()
    parent = parent._$parent
  }
  return this
}

exports.$clearContext = function() {
  if( this._$context ) {
    this._$contextLevel = null
    this._$context = null
  }
  return this
}

//contextChain
exports.$clearContextChain = function() {
  var context = this._$context
  var temp
  while( context ) {
    temp = context._$context
    context.$clearContext()
    context = temp
  }
  return this
}

exports.$setContextChain = function( chain ) {
  var bind = chain[0].bind || this
  var iterator = bind
  for(var j in chain) {
    iterator._$context = chain[j].context
    iterator._$contextLevel = chain[j].level
    iterator = iterator._$context
  }
  if(iterator) {
    iterator.$clearContextUp()
  }
  //----fix this this is way to ugly....----
  var parent = bind.$parent
  while(parent) {
    parent = parent.$parent
  }
  //----------------------------------------
  return bind
}

exports.$storeContextChain = function() {
  var chain = [
    {
      context: this._$context,
      level: this._$contextLevel,
      bind: this
    }
  ]
  var contextUp
  contextUp = this._$context
  while(contextUp) {
    if(contextUp._$context) {
      chain.push({
        context: contextUp._$context,
        level: contextUp._$contextLevel
      })
    }
    contextUp = contextUp._$context
  }
  return chain
}

},{}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/flags.js":[function(require,module,exports){
"use strict";

/**
 * @flag $useVal
 * @memberOf Base#
 * @param {*} val
 *   Overwrites default set handler and uses val for the property your defining
 *   setting to true returns the current instance of Base
 */
exports.$useVal = function( val ) {
  this._$useVal = val
}

exports.$Constructor = function( val ){
  this.$Constructor = val
}

/**
 * @flag $key
 * @memberOf Base#
 * @param {String} val Sets key
 * @return {String} returns property key
 */
exports.$key = function( val ) {
  if( this.$key !== val ) {
    this.$key = val
    return this
  }
}

exports.$ChildConstructor = function( val ) {
  var typeOf = typeof val
  // if( typeOf === 'function' ) {
  //   val = val.call( this )
  // } else
  if( typeOf === 'string' ) {
    val = this[val]
  }
  this.define({
    $ChildConstructor: val
  })
}

/**
 * @flag $
 * @memberOf Base#
 * @param {object} val
 *   loop trough val and call methods on base for each key
 *   arrays are parsed for multiple arguments
 *   if you want to pass an array as an argument use [ [ ... ] ]
*/
exports.$ = function( val ) {
  for( var key$ in val ) {
    if(val instanceof Array) {
      this[key$].apply( this, val[key$] )
    } else {
      this[key$]( val[key$] )
    }
  }
}

/**
 * @flag $define
 * @memberOf Base#
 * @param {object} val
 *   convenience wrapper for define
*/
exports.$define = function( val ) {
  if( val instanceof Array ) {
    this.define.apply( this, val )
  } else {
    this.define( val )
  }
}

/**
 * @flag $inject
 * @memberOf Base#
 * @param {object} val
 *   convenience wrapper for inject
*/
exports.$inject = function( val ) {
  if( val instanceof Array ) {
    this.inject.apply( this, val )
  } else {
    this.inject( val )
  }
}

},{}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/index.js":[function(require,module,exports){
"use strict";
var define = Object.defineProperty

/**
 * @namespace Base
 * @todo find a better name
 * @param  {*} val
 * @param  {Event} [event]
 * @param  {base} [parent]
 * @param  {string} [key]
 * @return {base}
 */
var Base = module.exports = function Base( val, event, parent, key ) {
  this.setParent( val, event, parent, key )
  if( val !== void 0 ) {
    this.set( val, event || false, true  )
  }
}

var proto = Base.prototype

define( proto, 'define', {
  value: function() {
    var val
    for( var i = 0, length = arguments.length; i < length; i++ ) {
      val = arguments[i]
      for( var key$ in val ) {
        var definition = val[key$]
        if( typeof definition === 'function' ||
            typeof definition !== 'object' ||
            typeof definition instanceof Base
        ) {
          definition = { value: definition }
        }
        definition.configurable = true
        define( this, key$, definition )
      }
    }
  },
  configurable:true
})

//you can see base as one file, split up for convienience (not injectable)
proto.define(
  require('./constructor'),
  require('./set'),
  require('./remove'),
  require('./context'),
  require('./context/util'),
  require('./setflags'),
  require('./inject'),
  require('./val')
)

proto.$flags = require('./flags.js')

proto.inject(
  require('../methods/each'),
  require('../methods/get')
)

},{"../methods/each":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/methods/each.js","../methods/get":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/methods/get.js","./constructor":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/constructor.js","./context":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/context/index.js","./context/util":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/context/util.js","./flags.js":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/flags.js","./inject":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/inject.js","./remove":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/remove.js","./set":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/set.js","./setflags":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/setflags.js","./val":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/val.js"}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/inject.js":[function(require,module,exports){
"use strict";

var Base = require('./')
var util = require('../util')
var define = Object.defineProperty

function inject(val) {

  var injected = val._injected
  var target

  if( !val.hasOwnProperty( '_injected' ) ) {
    //does not get called in set (since non-enum)
    define( val, '_injected', {
      configurable:true,
      value:[]
    })
    injected = val._injected
  } else {
    for( var i = 0, length = injected.length; i < length; i++ ) {
      target = injected[i]

      if(
        this === target ||
        ( target.hasOwnProperty('_$Constructor') &&
          target._$Constructor &&
          ( this instanceof target._$Constructor )
        )
      )
      {
        // console.warn('already injected!', val, ' on ', target)
        return
      }
    }
  }

  injected.push( this )

  var isFn = typeof val === 'function'

  if( isFn && val.prototype instanceof Base ) {
    val = val.prototype
    isFn = null
  }

  // console.error('inject!', this instanceof Base)

  //has to become more optimzied ;/
  if( isFn ) {
    //maybe check if its a constructor then make a new combination?
    val( this )
  } else if( util.isPlainObj( val ) ) {
    if( this instanceof Base || this === Base.prototype ) {
      //maybe not false for event else x etc does not update (change)
      this.set( val )
    } else {
      if( this.define ) {
        this.define( val )
      } else {
        for( var key$ in val ) {
          this[key$] = val
        }
      }
    }
  } else if( val instanceof Base ) {
    throw new Error('!!!Base and inject is not yet supported!!!')
    //do this one later!
    //dificulties arise /w prop definitions and flags
  }

}

exports.inject = function() {
  for( var i = 0, length = arguments.length; i < length; i++ ) {
    inject.call( this, arguments[i] )
  }
  return this
}

},{"../util":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/util/index.js","./":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/index.js"}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/remove.js":[function(require,module,exports){
"use strict";

var Base = require('./')
var util = require('../util')

//rename to removeFromParent
exports.$removeUpdateParent = function( parent, event, context ) {
  if( parent[this.$key] === null ) {
    return true
  }
  // console.log('im removing those keys! from parents')
  if( context ) {
    if( this._$context ) {
      // console.error( '\n\n\n\n\n\nhey what resolving context???', this.$path )
      this.$resolveContextSet( null, event, context )
    }
  } else {
    // console.warn('null key', this.$key)
    parent[this.$key] = null
  }
}

exports.$removeProperty = function( property, key, event, nocontext ) {
  //!this can be geatly optimized!
  //???how to get rid of the non-enum stuff??? (fix this when resolving define and inject)
  //system voor excludes
  if( key !== '$key' ) {
    if( this.hasOwnProperty( key )) {
      if( key !== '_$parent' ) {
        if( property instanceof Base ) {
          if( key !== '_$val' ) {
            //block if everything is allreayd removed?
            if( property._$parent === this ) {

              //TODO: 10 double check this....
              // console.log('is this smart?')
              property.$clearContext()
              //look fishy...
              property.remove( event, nocontext )
            }
          }
        }
      }

      this[key] = null
    } else {
      if(this._$context) {
        console.warn('maybe some stuff going wrong with context here in removeprop')
      }
      this[key] = null
    }
  }
}

exports.$removeProperties = function( event, nocontext, noparent ) {
  for( var key$ in this ) {
    if (key$ === '_$parent') {
      continue;
    } else {
      this.$removeProperty( this[key$], key$, event, nocontext )
    }
  }

  this._$parent = null;
  this.$parent = null;
  this._$val = null
}

exports.$removeInternal = function( event, nocontext, noparent ) {
  var parent = this._$parent
  if( !noparent && !nocontext && this._$context ) {
    return this.$removeUpdateParent( this.$parent, event, this._$context )
  } else {
    if( !noparent && parent ) {
      this.$removeUpdateParent( parent, event )
    }
    this.$removeProperties(  event, nocontext, noparent )
  }
}

exports.remove = function( event, nocontext, noparent ) {
  // if( this._$val === null ) {
  //   console.warn( 'already removed' )
  //   return true
  // }
  return this.$removeInternal( event, nocontext, noparent )
}

},{"../util":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/util/index.js","./":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/index.js"}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/set.js":[function(require,module,exports){
"use strict";

var Base = require('./')
var util = require('../util')
var isPlainObj = util.isPlainObj

/**
 * @function $setValue
 * @memberOf Base#
 * @todo find a better name
 * @param  {*} val
 *   The value that will be set on _$val
 *   adds a listener on val if val is a base
 * @param  {Event} [event] Current event
 * @return {Base} this
 */

exports.$setValueInternal = function( val, event ) {
  this._$val = val
  return this
}

exports.$setValue = function( val, event, resolveContextSet ) {
  if( val === this._$val ) {
    //maybe add && val!==null
    // console.log('!@#!@#!@#?')
    return
  }

  if( val === null ) {
    this.remove( event )
    return this
  }

  if( resolveContextSet ) {
    return this.$resolveContextSet( val, event )
  } else {
    return this.$setValueInternal( val, event )
  }
}

/**
 * @function set
 * @memberOf Base#
 * @param  {*} val The value that will be set on Base
 * @param  {Event} [event]
 *   when false events are not executed
 * @return {Base} this
 */
exports.set = function( val, event, nocontext ) {
  var base = this
  var resolveContextSet = !nocontext && base._$context


  if( isPlainObj(val) ) {
    if( resolveContextSet ) {
      base = base.$resolveContextSet( val, event)
    } else {
      var changed
      for( var key$ in val ) {
        if( base._$val === null ) {
          break;
        }
        if(key$ === '$val') {
          if( base.$setValue( val[key$], event, resolveContextSet ) ) {
            changed = true
          }
        } else {
          if( base.setKey( key$, val[key$], event, nocontext ) ) {
            changed = true
          }
        }
      }
      if(!changed) {
        return
      }
    }
  } else {
    base = base.$setValue( val, event, resolveContextSet )
  }

  return base
}

/**
 * @function $setKeyInternal
 * @memberOf Base#
 * @todo find a better name
 * @param  {String} key Key to be set on base
 * @param  {*} [val]
 *   The value that will be set on base[key]
 *   uses .set internaly
 *   checks for ._$useVal|.$useVal on val to overwrite default behaviour
 * @param  {Base} [property]
 *   property if base[key] is already defined
 * @param  {Event} [event]
 *   adds emiters to event if event is defined
 *   when false event emiters are not added
 */
exports.$setKeyInternal = function( key, val, property, event, nocontext ) {
  if( property) {

    if( property._$parent !== this ) {
      if( val === null ) {
        this[key] = null
        return this
      } else {
        var Constructor = property.$Constructor
        if( !Constructor ) {
          throw new Error('cannot set property "'+ key+ '"')
        } else {
          //this key can be changed
          this[key] = new Constructor( val, event, this, key )
          return this[key]
        }
      }
    } else {
      //return property.set( val, event, nocontext )
      var ret = property.set( val, event, nocontext )
      return
      //moet wel ret returnen...

      // return true
    }
  } else {
    if( val !== null ) {
      this.$addNewProperty( key, val, property, event )
      return this
    } else {
      return
    }
  }
}

exports.$addNewProperty = function( key, val, property, event ) {
  //this is slow!
  this[key] = this.$getPropertyValue( val, event, this, key )
  if( this.hasOwnProperty( '_$Constructor' ) ) {
    this.$createContextGetter( key )
  }
}

function checkUseVal( useVal, val, event, parent, key ) {
  val = useVal === true ? val : useVal
  if( !parent.$strictType || parent.$strictType( val ) ) {
    if( val instanceof Base) {
      if( !val._$parent || val._$parent === parent ) {
        val.$key = key
        val._$parent = parent
        return val
      }
    } else {
      return val
    }
  }
}

exports.$getPropertyValue = function( val, event, parent, key ) {
  var useVal
  if( val !== void 0 && ( useVal = val._$useVal || val.$useVal ) ) {
    return checkUseVal( useVal, val, event, parent, key  )
  } else {
    return new parent.$ChildConstructor( val, event, parent, key )
  }
}

/**
 * @function setKey
 * @memberOf Base#
 * Uses $setKeyInternal or $flag[key]
 * @param  {String} key
 *   Key set on base using $setKeyInternal
 *   Checks if a match is found on Base.$flags
 * @param  {*} [val]
 *   The value that will be set on base[key]
 * @param  {Event} [event] Current event
 */
exports.setKey = function( key, val, event, nocontext ) {
  if( this.$flags[key] ) {
    return this.$flags[key].call( this, val, event, nocontext )
  } else {
    return this.$setKeyInternal( key, val, this[key], event, nocontext )
  }
}

},{"../util":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/util/index.js","./":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/index.js"}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/setflags.js":[function(require,module,exports){
"use strict";

var Base = require('./')
var util = require('../util')

var Flags = function(){}
var flagProto = Flags.prototype

//$flags are bascily setters now maybe make it into propertyDescriptors
//but only on .set

Flags.$ConstructorHelper = function flagConstructorHelper( Constructor, key ) {
  var proto = Constructor.prototype
  proto._$useVal = true
  if(!proto.$key) {
    proto.$key = key
  }

  function setFlagConstructorHelper( val, event, nocontext ) {
    var flag = this[key]
    if(!flag) {
      this.$addNewProperty(
        key,
        new Constructor( val, event, this, key ),
        void 0,
        event || void 0
      )
    } else {
      return this.$setKeyInternal( key, val, flag, event, nocontext )
    }
  }
  setFlagConstructorHelper.$base = proto
  //TODO: this can become a lot lighter (share method for example)
  return setFlagConstructorHelper
}

flagProto.$flags = function( val, event ) {
  if(!util.isPlainObj(val)) {
    throw new Error('$flags needs to be set with a plain object')
  }
  var flags = this._$flags
  if(flags.$binds !== this) {
    var DerivedFlags = function(){}
    DerivedFlags.prototype = flags
    this._$flags = flags = new DerivedFlags()
    flags.$binds = this
  }
  for( var key$ in val ) {
    var flag = val[key$]
    if( flag instanceof Base ) {
      flag = flag.$Constructor
    }
    this.$flagTypes.call( this, flags, flag, key$, val, event )
  }
}

//$binds means the current vObj flags are bound to
flagProto.$binds = Base

exports._$flags = {
  value: new Flags(),
  writable:true
}

exports.$flagTypes = function( flags, flag, key, val, event, nocontext ) {
  if( flag.prototype instanceof Base ) {
    flags[key] = Flags.$ConstructorHelper( flag, key )
  } else if( typeof flag ==='function' ) {
    flags[key] = flag
  } else {
    console.warn('flags - custom objects are not supported yet')
  }
}

exports.$flags = {
  get:function() {
    return this._$flags
  },
  set:function( val ) {
    this._$flags.$flags.call( this, val )
  }
}

//maybe make define /w with setKeyFlags
//and definitions

},{"../util":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/util/index.js","./":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/index.js"}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/val.js":[function(require,module,exports){
"use strict";

var Base = require('./')

/**
 * @name  $origin
 * @type {base}
 */
exports.$origin =  {
  get:function() {
    var reference = this
    while( reference._$val instanceof Base ) {
      reference = reference._$val
    }
    return reference
  }
}

exports.$parseValue = function( previousValue, origin ) {
  if(!origin) {
    origin = this
  }
  var val = this._$val

  if(val) {
    if( typeof val === 'function' ) {
      //make this into a funciton e.g. $execGetterFunction $bindGetter
      var context = this._$bind && this._$bind._$val || this
      if( context ) {
        if( typeof context === 'function' ) {
          //send val as well -- take previous val into account in $parseValue
          context = context.call(this, previousValue)
        } else if( context === '$parent' ) { 
          //this will be replaced with a general path functionality (that includes)
          context = this.$parent
        } else {
          context = this
        }
      }
      val = val.call(context, previousValue)
    } else if( val instanceof Base ) {
      if(val !== origin) {
        val = val.$parseValue( void 0, origin )          
      } else {
        console.error(
          'parsingValue from same origin (circular)',
          'path:', this.$path,
          'origin:', origin.$path
        )
      }
    } else {
      val = this._$val
    }
  }

  if(val === void 0) {
    val = this
  }
  
  return val
}
/**
 * Returns the value of a base object
 * @name  $val
 * @type {*}
 */
exports.$val = {
  get:function() {
    return this.$parseValue()
  },
  set:function( val ) {
    this.set( val )
  }
}


},{"./":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/index.js"}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/methods/each.js":[function(require,module,exports){
"use strict";

/**
 * @function each: iterates in an array or object passed as context(this)
 * @memberOf Base
 * @param  {Function} fn: the function in which will be executed for every item or value/key in the array/object
 * @param {Function} excludes: a function or string (only allowed for objects) to be ignored when iterating
 * @return {*}
 */
exports.$define = {
  each: function( fn, excludes, attach, extraArg1, extraArg2 ) {
    var length = this.length
    if(length !== void 0) {
      for( var i = 0 ; i < length ; i++ ) {
        if( !excludes ||
            ( typeof excludes === 'function'
              ? !excludes( this[i], i, this, attach, extraArg1, extraArg2 )
              : key$ !== excludes
            )
          ) {
          var ret = fn( this[i], i, this, attach, extraArg1, extraArg2 )
          if( ret ) {
            return ret
          }
        }
      }
    } else {
      for( var key$ in this ) {
        var type = key$[0]
        //fix that if you add a function as excludes you can run trough _ and $ perhaps?
        if( type !== '_' &&
            type !== '$' &&
            this[key$] !== null &&
            ( !excludes ||
              ( typeof excludes === 'function'
                ? !excludes( this[key$], key$, this, attach, extraArg1, extraArg2 )
                : key$ !== excludes
              )
            )
        ) {
          var ret = fn( this[key$], key$, this, attach, extraArg1, extraArg2 )
          if( ret ) {
            return ret
          }
        }
      }
    }
    return this
  }
}

},{}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/methods/get.js":[function(require,module,exports){
"use strict";

var helpers = require('./shared')
var getPath = helpers.getPath
var returnPath = helpers.returnPath

/**
 * @function get
 * @memberOf Base#
 * @param  {string|string[]} path Path or field to get and/or set
 * @param  {*} [set] Value to set on path
 * @return {base}
 */
exports.$define = {
  get: function( path, set ){
    path = returnPath( path )
    var result = getPath( this, path, path.length, void 0, set )
    if( result ){
      return result
    }
  }
}
},{"./shared":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/methods/shared.js"}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/methods/shared.js":[function(require,module,exports){
"use strict";

var evaluate = require('../util/test')
var isPlainObj = require('../util').isPlainObj
var createPath
var getPath

exports.clean = function( obj, index ){
  if(obj.constructor === Array){
    return obj.splice(0,index)
  }
  while(obj[index]){
    delete obj[index++]
  }
  return obj
}

exports.createPath = createPath = function( obj, path, length, set ){
  var setObj = {}
  var nextObj = setObj
  var i = 0
  var field
  for(;i < length - 1; i++ ) {
    field = path[i]
    nextObj[field] = {}
    nextObj = nextObj[field]
  }
  if(set !== void 0){
    nextObj[path[i]] = set
  }else{
    nextObj[path[i]] = {}
  }
  obj.set(setObj)
  return getPath( obj, path, length )
}

exports.getPath = getPath = function( obj, path, length, filter, set ) {
  var i = 0
  var result = obj[path[0]]

  while( result ) {
    if ( ++i === length ) {
      if( filter === void 0 || filter(result, obj) ){
        return result
      }
    }
    if( typeof result === 'function' ){
      return result.call( obj,path.splice(i), filter )
    }
    obj = result
    result = result[path[i]]
  }

  if(set !== void 0){
    return createPath(obj, path.splice(i), length - i, set)
  }
}

exports.returnFilter = function( options ){
  if( options !== void 0 ){
    var conditions
    var filter

    if( typeof options === 'function' ){
      return options
    }

    if( isPlainObj( options ) ){
      conditions = options.conditions

      if( conditions ){
        return function( subject ){
          return evaluate( subject, conditions )
        }
      }

      if( options instanceof RegExp ){
        return function( subject ){
          return options.test ( subject )
        }
      }

      if( options.constructor === Array ){
        var length = options.length
        return function( subject ){
          for( var i = length - 1; i >= 0; i-- ) {
            var value = options[i]
            if( subject === value || subject._$val === value ){
              return true
            }
          }
        }
      }

    } else {
      return function( subject ){
        return subject === options || subject._$val === options
      }
    }
  }
}

exports.returnPath = function( path ){
  return typeof path === 'string' ? path.split('.') : path
}

},{"../util":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/util/index.js","../util/test":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/util/test.js"}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/util/index.js":[function(require,module,exports){
"use strict";
var Base = require('../base')
var isNumber = require('lodash/lang/isNumber')
//making these kind of util functions
//is a very fast way to work (they get extra optimized by v8 if used by everything)

//utils can become seperate files (cleaner)

//instanceof object is slower then typeof (15%), this goes against popular believe
//also faster then using lodash isObj (the check is not as solid but we dont support old platforms)
//it does not check for plain Obj but checks for non-vigour objects
exports.isPlainObj = function( obj ) {
  return (
    typeof obj === 'object' &&
    !(obj instanceof Base) &&
    obj !== null
  )
}

//use this when trying to convert args into an array
exports.convertToArray = function( obj, index ) {
  var args = []
  for( var i = index || 0, length = obj.length; i < length; i++ ) {
    // args[i] = obj[i]
    args.push(obj[i])
  }
  return args
}

exports.isNumber = isNumber

exports.isLikeNumber = function( val ) {
  if( val === null ) {
    return;
  }
  var length = val.length
  if( !length ) {
    return isNumber( val )
  }
  var i = 0;
  //charAt is faster in v8
  if( val.charAt(0) === '-' ) {
    if( length === 1 ) {
      return;
    }
    i = 1
  }
  for ( ;i < length; i++ ) {
    var c = val.charAt(i)
    //bit range is outside number range
    if (c <= '/' || c >= ':') {
      return;
    }
  }
  return true
}

exports.isEmpty = function( obj ) {
  //this can become greatly improved
  //weird stuff going on -- find something better
  //hasOwnproperty is not good though...
  //do perf tests here...
  //eg. on emitters this does not work (emitters use $)
  //maybe remove $ remove in emitters?
  //maybe make .isEmpty as a method - that is configurable?
  for( var key$ in obj ) {
    if( key$[0] !== '_' && key$[0] !== '$' && obj[key$] !== null ) {
      // console.log('hello?', key$, obj[key$] )
      return false
    }
  }
  return true
}

exports.isRemoved = function( base ) {
  for( var key$ in base ) {
    if( base.hasOwnProperty( key$) ) {
      //temp fix -- should become configurable
      //this thing is only used in tests however
      if( base[key$] !== null
          && key$ !== '$key'
          && key$ !== '$lastStamp'
      ) {
        return false
      }
    }
  }
  if( base._$val !== null ) {
    return false
  }
  return true
}

},{"../base":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/index.js","lodash/lang/isNumber":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/node_modules/lodash/lang/isNumber.js"}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/util/test.js":[function(require,module,exports){
"use-strict";

var makeTest = exports.makeTest = function (conditions, subsObj, gotval) {
  var val = getValue(conditions)
  if(typeof conditions === 'object') {
    var keys = getKeys(conditions)
    var length = keys.length
    if(length === 1) {
      var key = keys[0]
      var test = makeKeyTest(key, conditions[key], subsObj)
      if(gotval) {
        return test
      } else {
        return function(doc){
          return test(getValue(doc))
        }  
      }
    } else if(length) {
      return makeAND(conditions, subsObj)
    } else {
      console.error('empty conditions object?')
      return alwaysTrue
    }
  }
}

function makeKeyTest(key, value, subsObj) {
  value = value.$val

  var test
  var endpoint = !(value instanceof Object)
  
  switch (key) {
    case '$not':
      if(endpoint) {
        test = function(doc) {
          return doc !== value
        }
      } else {
        var follow = makeTest(value, subsObj, true)
        test = function(doc) {
          return follow(doc) === false
        }
      }
      break
    case '$ne':
      test = function(doc) {
        return doc !== value
      }
      break
    case '$and':
      test = makeAND(value, subsObj)
      break
    case '$nand':
      var and = makeAND(value, subsObj)
      test = function(doc) {
        return !and(doc)
      }
      break
    case '$or':
      test = makeOR(value, subsObj)
      break
    case '$nor':
      var or = makeOR(value, subsObj)
      test = function(doc) {
        return !or(doc)
      }
      break
    case '$every':
      subsObj.setKey('any$', {})
      if(endpoint) {
        subsObj.any$.$val = true
        test = function(doc) {
          var result = doc && doc.$each && true
          if(result) {
            doc.$each(function(){
              if(getValue(this) !== value) {
                result = false
                return true
              }
            })
          }
          return result || false
        }
      } else {
        var follow = makeTest(value, subsObj.any$, true)
        test = function(doc) {
          var result = doc && doc.$each && true
          if(result) {
            doc.$each(function(){
              if(!follow(getValue(this))) {
                result = false
                return true
              }
            })
          }
          return result || false
        }
      }
      break
    case '$nevery':
      var every = makeKeyTest('$every', value, subsObj)
      test = function(doc) {
        return !every(doc)
      }
      break
    case '$':
    case '$any':
      subsObj.setKey('any$', {})
      if(endpoint) {
        subsObj.any$.$val = true
        test = function(doc) {
          var result = doc && doc.$each
          if(result) {
            result = false
            doc.$each(function(base){
              if(getValue(base) === value) {
                return result = true
              }
            })
          }
          return result || false
        }
      } else {
        var follow = makeTest(value, subsObj.any$, true)
        test = function(doc) {
          var result = doc && doc.$each
          if(result) {
            result = false
            doc.$each(function(base){
              if(follow(getValue(base))) {
                return result = true
              }
            })
          }
          return result || false
        }
      }
      break
    case '$nany':
      var any = makeKeyTest('$any', value, subsObj)
      test = function(doc){
        return !any(doc)
      }
      break
    case '$lt':
      test = function(doc) {
        return doc < value
      }
      break
    case '$lte':
      test = function(doc) {
        return doc <= value
      }
      break
    case '$gt':
      test = function(doc) {
        return doc > value
      }
      break
    case '$gte':
      test = function(doc) {
        return doc >= value
      }
      break
    case '$contains':
      if(!(value instanceof RegExp)) {
        value = new RegExp(value, 'i')
      }
      test = function(doc) {
        console.log('testing', doc, 'for contains', value)
        return value.test(doc)
      }
      break
    case '$ncontains':
      if(!(value instanceof RegExp)) {
        value = new RegExp(value, 'i')
      }
      test = function(doc) {
        return !value.test(doc)
      }
      break
    case '$has':
      test = function(doc) {
        return doc && doc[value] !== void 0
      }
      break
    case '$nhas':
      test = function(doc) {
        return !doc || doc[value] === void 0
      }
      break
    case '$exists':
      test = function(doc) {
        return (doc !== void 0 && doc !== null) === value
      }
      break
    case '$nexists':
      test = function(doc) {
        return (doc === void 0 || doc === null) === value
      }
      break
    case '$in':
      var list = []
      value.$each(function(){
        list.push(getValue(this))
      })
      test = function(doc) {
        for (var i = 0, l = list.length; i < l; i++) {
          if (doc === list[i]) return true
        }
        return false
      }
      break
    case '$nin':
      var list = []
      value.$each(function(){
        list.push(getValue(this))
      })
      test = function(doc) {
        for (var i = 0, l = list.length; i < l; i++) {
          if (doc === list[i]) return false
        }
        return true
      }
      break
    default:
      if(endpoint) {
        test = function(doc) {
          doc = getPropertyValue(doc, key)
          return doc === value
        }
        subsObj.setKey(key, true)
        endpoint = null
      } else {
        var nextSubsObj = subsObj[key]
        if(!nextSubsObj) {
          subsObj.setKey(key, {})
          nextSubsObj = subsObj[key]
        }
        var follow = makeTest(value, nextSubsObj, true)
        test = function(doc) {
          doc = getPropertyValue(doc, key)
          return follow(doc)
        }
      }
    break
  }

  if(endpoint) {
    subsObj.$val = true
  }

  return test

}

function getValue(base) {
  base = base.$origin
  return base.$val
}

function getPropertyValue(base, key) {
  base = base.$origin
  base = base[key]
  if(base) {
    return getValue(base)
  }
}

function getKeys(base) {
  var keys = []
  for(var k in base) {
    if(k[0] !== '_' && k !== '$bind'){ // TODO: properly exclude keys
      keys.push(k)
    }
  }
  return keys
}

function alwaysTrue(){
  return true
}

function makeList(value, subsObj) {
  var list = []
  value.$each(function(){
    list.push(makeTest(this, subsObj, true))
  })
  return list
}

function makeAND(value, subsObj) {
  var testList = makeList(value, subsObj)
  return function(doc) {
    for (var i = 0, l = testList.length; i < l; i++) {
      if (!testList[i](doc)) {
        return false
      }
    }
    return true
  }
}

function makeOR(value, subsObj) {
  var testList = makeList(value, subsObj)
  return function(doc) {
    for (var i = 0, l = testList.length; i < l; i++) {
      if (testList[i](doc)) {
        return true
      }
    }
    return false
  }
}

},{}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/node_modules/lodash/internal/isObjectLike.js":[function(require,module,exports){
/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/node_modules/lodash/lang/isNumber.js":[function(require,module,exports){
var isObjectLike = require('../internal/isObjectLike');

/** `Object#toString` result references. */
var numberTag = '[object Number]';

/** Used for native method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
 * as numbers, use the `_.isFinite` method.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isNumber(8.4);
 * // => true
 *
 * _.isNumber(NaN);
 * // => true
 *
 * _.isNumber('8.4');
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
}

module.exports = isNumber;

},{"../internal/isObjectLike":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/node_modules/lodash/internal/isObjectLike.js"}],"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/global.less":[function(require,module,exports){
require('./some-other-global.less');

},{"./some-other-global.less":"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/some-other-global.less"}],"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/some-other-global.less":[function(require,module,exports){

},{}],"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/src/index.js":[function(require,module,exports){
require('./styles.less');

require('./module');

var Base = require('vjs/lib/base')

console.log('in src/index.js');

var a = new Base({
  b: 'bbbbbbbbb'
});

console.log('a', a);
},{"./module":"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/src/module/index.js","./styles.less":"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/src/styles.less","vjs/lib/base":"/Users/andrepadez/develop/vigour-io/gaston/node_modules/vjs/lib/base/index.js"}],"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/src/module/index.js":[function(require,module,exports){
require('./styles.less')

console.log('in src/module/index.js');

console.log('hehehehehehe')

require('./some-file')

},{"./some-file":"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/src/module/some-file.js","./styles.less":"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/src/module/styles.less"}],"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/src/module/some-file.js":[function(require,module,exports){
arguments[4]["/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/some-other-global.less"][0].apply(exports,arguments)
},{}],"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/src/module/styles.less":[function(require,module,exports){
require('../../global.less');

},{"../../global.less":"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/global.less"}],"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/src/styles.less":[function(require,module,exports){
require('../global.less');

},{"../global.less":"/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/global.less"}],"package.json":[function(require,module,exports){
module.exports={}
},{}]},{},["/Users/andrepadez/develop/vigour-io/gaston/test/to-compile/src/index.js"]);
