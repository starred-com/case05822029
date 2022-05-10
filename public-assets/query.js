(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Query"] = factory();
	else
		root["Query"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _classCallCheck = __webpack_require__(1)['default'];
	
	var _Array$slice = __webpack_require__(2)['default'];
	
	var _Promise = __webpack_require__(11)['default'];
	
	var _Number$isFinite = __webpack_require__(60)['default'];
	
	var _interopRequireDefault = __webpack_require__(63)['default'];
	
	exports.__esModule = true;
	
	var _assert = __webpack_require__(64);
	
	var _assert2 = _interopRequireDefault(_assert);
	
	var _filter2 = __webpack_require__(65);
	
	var _filter3 = _interopRequireDefault(_filter2);
	
	// An simple library to help write DQL
	
	// lazy eval
	function lazy(value) {
	  return typeof value === 'function' ? value() : value;
	}
	
	// lazy eval with single quote necapsulation
	function encapsulate(value) {
	  return '\'' + lazy(value) + '\'';
	}
	
	var Query = (function () {
	  function Query() {
	    _classCallCheck(this, Query);
	
	    this._calendar = undefined;
	    this._query = {};
	    this._columnNames = [];
	    this._filters = [];
	    this._aggregations = [];
	
	    this._dateGrainAggregations = {};
	    this._dateGrainColumn = undefined;
	    this._dateGrainGrain = undefined;
	
	    this._groupByColumns = [];
	    this._orderByColumns = [];
	
	    // alternate syntax
	    this.and = this.where;
	    this.skip = this.offset;
	  }
	
	  Query.prototype.useFiscalCalendar = function useFiscalCalendar(bool) {
	    this._calendar = bool;
	    return this;
	  };
	
	  Query.prototype.select = function select(columnNames) {
	    if (typeof columnNames === 'function' || Array.isArray(columnNames)) {
	      this._columnNames = columnNames;
	    } else {
	      this._columnNames = _Array$slice(arguments);
	    }
	    return this;
	  };
	
	  Query.prototype.where = function where(columnName, fn) {
	    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	      args[_key - 2] = arguments[_key];
	    }
	
	    var filter;
	    if (arguments.length >= 3) {
	      var _filter;
	
	      filter = new _filter3['default'](this, columnName);
	      (_filter = filter).dynamic.apply(_filter, [fn].concat(args));
	      this._filters.push(filter);
	      return this;
	    } else {
	      filter = new _filter3['default'](this, columnName);
	      this._filters.push(filter);
	      return filter;
	    }
	  };
	
	  Query.prototype.groupBy = function groupBy(columnNames, aggregations) {
	    var _this = this;
	
	    if (Array.isArray(columnNames)) {
	      columnNames.forEach(function (name) {
	        _this._groupByColumns.push(name);
	      });
	    } else {
	      this._groupByColumns.push(columnNames);
	    }
	    this.aggregate(aggregations);
	    return this;
	  };
	
	  Query.prototype.dateGrain = function dateGrain(columnName, grain, aggregations) {
	    this._dateGrainColumn = columnName;
	    this._dateGrainGrain = grain;
	    this.aggregate(aggregations);
	    return this;
	  };
	
	  Query.prototype.currentPeriod = function currentPeriod(columnName, interval) {
	    console.warn('[Query]: Current Period not supported');
	    return this;
	  };
	
	  Query.prototype.previousPeriod = function previousPeriod(columnName, interval) {
	    var dictionary = {
	      days: 'day',
	      weeks: 'week',
	      months: 'month',
	      quarters: 'quarter',
	      years: 'year',
	      day: 'day',
	      week: 'week',
	      month: 'month',
	      quarter: 'quarter',
	      year: 'year'
	    };
	
	    this._filters.push({
	      query: function query() {
	        var _interval = dictionary[lazy(interval).toLowerCase()] || 'month';
	        // fix this by changing single quotes to double once the service layer is updated
	        return [encapsulate(columnName), ' last ', lazy(interval.toLowerCase())].join('');
	      }
	    });
	    return this;
	  };
	
	  Query.prototype.rollingPeriod = function rollingPeriod(columnName, interval, count) {
	    var dictionary = {
	      hours: 'hours',
	      days: 'days',
	      weeks: 'weeks',
	      months: 'months',
	      quarters: 'quarters',
	      years: 'years',
	      day: 'days',
	      week: 'weeks',
	      month: 'months',
	      quarter: 'quarters',
	      year: 'years'
	    };
	
	    this._filters.push({
	      query: function query() {
	        var _interval = dictionary[lazy(interval).toLowerCase()] || 'months';
	        // fix this by changing single quotes to double once the service layer is updated
	        return [encapsulate(columnName), ' last ', lazy(count), ' ', lazy(_interval)].join('');
	      }
	    });
	    return this;
	  };
	
	  Query.prototype.periodToDate = function periodToDate(columnName, interval) {
	    var dictionary = {
	      days: 'day',
	      weeks: 'week',
	      months: 'month',
	      quarters: 'quarter',
	      years: 'year',
	      day: 'day',
	      week: 'week',
	      month: 'month',
	      quarter: 'quarter',
	      year: 'year'
	    };
	
	    this._filters.push({
	      query: function query() {
	        // fix this by changing single quotes to double once the service layer is updated
	        var _interval = dictionary[lazy(interval).toLowerCase()] || 'month';
	        return [encapsulate(columnName), ' todate ', lazy(_interval)].join('');
	      }
	    });
	    return this;
	  };
	
	  Query.prototype.orderBy = function orderBy(columnName, direction) {
	    this._orderByColumns.push({
	      name: columnName,
	      direction: direction
	    });
	    return this;
	  };
	
	  Query.prototype.limit = function limit(val) {
	    this._limit = val;
	    return this;
	  };
	
	  Query.prototype.offset = function offset(val) {
	    this._offset = val;
	    return this;
	  };
	
	  Query.prototype.aggregate = function aggregate(column, type) {
	    this._aggregations.push([column, type]);
	    return this;
	  };
	
	  Query.prototype.query = function query(alias) {
	    var i;
	    var len;
	    var query;
	    var calendar;
	    var queryOperator = '?';
	    alias = lazy(alias);
	
	    var orderDictionary = {
	      ascending: 'ascending',
	      asc: 'ascending',
	      descending: 'descending',
	      desc: 'descending'
	    };
	
	    var grainDictionary = {
	      days: 'day',
	      weeks: 'week',
	      months: 'month',
	      quarters: 'quarter',
	      years: 'year',
	      day: 'day',
	      week: 'week',
	      month: 'month',
	      quarter: 'quarter',
	      year: 'year'
	    };
	
	    var resolvedColumnNames = lazy(this._columnNames).map(lazy);
	
	    var resolvedAggregations = this._aggregations.reduce(function (res, agg) {
	      var column = lazy(agg[0]);
	      var type = lazy(agg[1]);
	      if (typeof column === 'object') {
	        for (var name in column) {
	          var t = lazy(column[name]);
	          if (res[t] && name) {
	            res[t].push(encapsulate(name));
	          }
	        }
	      } else {
	        if (res[type] && column) {
	          res[type].push(encapsulate(column));
	        }
	      }
	      return res;
	    }, { sum: [], avg: [], count: [], unique: [], min: [], max: [] });
	
	    //console.log(resolvedAggregations);
	
	    // select
	    if (resolvedColumnNames.length) {
	      query = ['/data/v1/', alias, '?fields=', resolvedColumnNames.map(encodeURIComponent).join(', ')].join('');
	      queryOperator = '&';
	    } else {
	      query = ['/data/v1/', alias].map(lazy).join('');
	    }
	
	    if (this._filters.length) {
	      query += queryOperator + 'filter=';
	
	      // filters
	      for (i = 0, len = this._filters.length; i < len; i++) {
	        query += this._filters[i].query();
	        query += i < len - 1 ? ', ' : '';
	      }
	      queryOperator = '&';
	    }
	
	    // dateGrain
	    if (this._dateGrainColumn) {
	      query += queryOperator + 'dategrain=' + encapsulate(this._dateGrainColumn) + ' by ' + grainDictionary[lazy(this._dateGrainGrain).toLowerCase()];
	      queryOperator = '&';
	    }
	
	    // groupBy
	    if (this._groupByColumns.length) {
	      query += queryOperator + 'groupby=' + this._groupByColumns.map(encapsulate).join(',');
	      queryOperator = '&';
	    }
	
	    // orderBy
	    if (this._orderByColumns.length) {
	      query += queryOperator + 'orderby=' + this._orderByColumns.map(function (obj) {
	        var direction = lazy(obj.direction);
	        direction = direction ? orderDictionary[direction.toLowerCase()] : 'ascending';
	        return encapsulate(obj.name) + ' ' + direction;
	      }).join(', ');
	      queryOperator = '&';
	    }
	
	    // aggregations
	    for (var agg in resolvedAggregations) {
	      var columns = resolvedAggregations[agg].join(',');
	      if (columns !== '') {
	        query += queryOperator + agg + '=' + columns;
	        queryOperator = '&';
	      }
	    }
	
	    // Offset
	    if (this._offset) {
	      query += queryOperator + 'offset=' + lazy(this._offset);
	      queryOperator = '&';
	    }
	
	    // Limit
	    if (this._limit) {
	      query += queryOperator + 'limit=' + lazy(this._limit);
	      queryOperator = '&';
	    }
	
	    // Calendar
	    if (this._calendar) {
	      calendar = lazy(this._calendar) ? 'fiscal' : 'standard';
	      query += queryOperator + 'calendar=' + calendar;
	      queryOperator = '&';
	    }
	
	    return query;
	  };
	
	  Query.prototype.fetch = function fetch(alias, config) {
	    /*jslint latedef:false*/
	    var url = this.query(alias);
	    var data;
	    var promise;
	    var request = new XMLHttpRequest();
	    request.open('GET', url, true);
	    request.setRequestHeader('Accept', getAcceptType(config));
	
	    if (config && config.timeout) handleTimeout(request, config.timeout);
	
	    promise = new _Promise(function (resolve, reject) {
	      request.onload = function () {
	        if (request.status >= 200 && request.status < 400) {
	          // Success!
	          try {
	            data = JSON.parse(request.responseText);
	          } catch (err) {
	            reject(err);
	          }
	          resolve(data);
	        } else {
	          // We reached our target server, but it returned an error
	          reject(request);
	        }
	      };
	
	      request.onerror = function (err) {
	        // There was a connection error of some sort
	        reject(err);
	      };
	
	      request.send();
	    });
	
	    return promise;
	
	    function getAcceptType(config) {
	      var acceptType;
	      // for backwards compatibility
	      if (typeof config === 'string' || config instanceof String) {
	        acceptType = config;
	      } else if (typeof config === 'object' && config.hasOwnProperty('acceptType')) {
	        acceptType = config.acceptType;
	      }
	
	      return acceptType || 'application/array-of-objects';
	    }
	
	    function handleTimeout(xhr, timeout) {
	      if (_Number$isFinite(timeout) && timeout > 0) {
	        // is a number
	        setTimeout(function () {
	          return xhr.abort();
	        }, timeout);
	      } else if (typeof timeout.then === 'function') {
	        // is a promise
	        timeout.then(function () {
	          return xhr.abort();
	        });
	      }
	    }
	  };
	
	  return Query;
	})();
	
	if (false) {
	  require('./filter.spec')(_filter3['default']);
	  require('./query.spec')(Query);
	}
	
	exports['default'] = Query;
	module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	"use strict";
	
	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	
	exports.__esModule = true;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(3), __esModule: true };

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	module.exports = __webpack_require__(8).Array.slice;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	// JavaScript 1.6 / Strawman array statics shim
	var $       = __webpack_require__(5)
	  , $export = __webpack_require__(6)
	  , $ctx    = __webpack_require__(9)
	  , $Array  = __webpack_require__(8).Array || Array
	  , statics = {};
	var setStatics = function(keys, length){
	  $.each.call(keys.split(','), function(key){
	    if(length == undefined && key in $Array)statics[key] = $Array[key];
	    else if(key in [])statics[key] = $ctx(Function.call, [][key], length);
	  });
	};
	setStatics('pop,reverse,shift,keys,values,entries', 1);
	setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
	setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
	           'reduce,reduceRight,copyWithin,fill');
	$export($export.S, 'Array', statics);

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(7)
	  , core      = __webpack_require__(8)
	  , ctx       = __webpack_require__(9)
	  , PROTOTYPE = 'prototype';
	
	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    if(IS_PROTO)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	// type bitmap
	$export.F = 1;  // forced
	$export.G = 2;  // global
	$export.S = 4;  // static
	$export.P = 8;  // proto
	$export.B = 16; // bind
	$export.W = 32; // wrap
	module.exports = $export;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	var core = module.exports = {version: '1.2.6'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(10);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(12), __esModule: true };

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(13);
	__webpack_require__(14);
	__webpack_require__(32);
	__webpack_require__(39);
	module.exports = __webpack_require__(8).Promise;

/***/ }),
/* 13 */
/***/ (function(module, exports) {



/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(15)(true);
	
	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(18)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(16)
	  , defined   = __webpack_require__(17);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ }),
/* 17 */
/***/ (function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(19)
	  , $export        = __webpack_require__(6)
	  , redefine       = __webpack_require__(20)
	  , hide           = __webpack_require__(21)
	  , has            = __webpack_require__(25)
	  , Iterators      = __webpack_require__(26)
	  , $iterCreate    = __webpack_require__(27)
	  , setToStringTag = __webpack_require__(28)
	  , getProto       = __webpack_require__(5).getProto
	  , ITERATOR       = __webpack_require__(29)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';
	
	var returnThis = function(){ return this; };
	
	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , methods, key;
	  // Fix native
	  if($native){
	    var IteratorPrototype = getProto($default.call(new Base));
	    // Set @@toStringTag to native iterators
	    setToStringTag(IteratorPrototype, TAG, true);
	    // FF fix
	    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    // fix Array#{values, @@iterator}.name in V8 / FF
	    if(DEF_VALUES && $native.name !== VALUES){
	      VALUES_BUG = true;
	      $default = function values(){ return $native.call(this); };
	    }
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES  ? $default : getMethod(VALUES),
	      keys:    IS_SET      ? $default : getMethod(KEYS),
	      entries: !DEF_VALUES ? $default : getMethod('entries')
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	module.exports = true;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(21);

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(5)
	  , createDesc = __webpack_require__(22);
	module.exports = __webpack_require__(23) ? function(object, key, value){
	  return $.setDesc(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(24)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ }),
/* 24 */
/***/ (function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ }),
/* 25 */
/***/ (function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ }),
/* 26 */
/***/ (function(module, exports) {

	module.exports = {};

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var $              = __webpack_require__(5)
	  , descriptor     = __webpack_require__(22)
	  , setToStringTag = __webpack_require__(28)
	  , IteratorPrototype = {};
	
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(21)(IteratorPrototype, __webpack_require__(29)('iterator'), function(){ return this; });
	
	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = $.create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	var def = __webpack_require__(5).setDesc
	  , has = __webpack_require__(25)
	  , TAG = __webpack_require__(29)('toStringTag');
	
	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	var store  = __webpack_require__(30)('wks')
	  , uid    = __webpack_require__(31)
	  , Symbol = __webpack_require__(7).Symbol;
	module.exports = function(name){
	  return store[name] || (store[name] =
	    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
	};

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(7)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ }),
/* 31 */
/***/ (function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(33);
	var Iterators = __webpack_require__(26);
	Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(34)
	  , step             = __webpack_require__(35)
	  , Iterators        = __webpack_require__(26)
	  , toIObject        = __webpack_require__(36);
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(18)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ }),
/* 34 */
/***/ (function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ }),
/* 35 */
/***/ (function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(37)
	  , defined = __webpack_require__(17);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(38);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ }),
/* 38 */
/***/ (function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var $          = __webpack_require__(5)
	  , LIBRARY    = __webpack_require__(19)
	  , global     = __webpack_require__(7)
	  , ctx        = __webpack_require__(9)
	  , classof    = __webpack_require__(40)
	  , $export    = __webpack_require__(6)
	  , isObject   = __webpack_require__(41)
	  , anObject   = __webpack_require__(42)
	  , aFunction  = __webpack_require__(10)
	  , strictNew  = __webpack_require__(43)
	  , forOf      = __webpack_require__(44)
	  , setProto   = __webpack_require__(49).set
	  , same       = __webpack_require__(50)
	  , SPECIES    = __webpack_require__(29)('species')
	  , speciesConstructor = __webpack_require__(51)
	  , asap       = __webpack_require__(52)
	  , PROMISE    = 'Promise'
	  , process    = global.process
	  , isNode     = classof(process) == 'process'
	  , P          = global[PROMISE]
	  , empty      = function(){ /* empty */ }
	  , Wrapper;
	
	var testResolve = function(sub){
	  var test = new P(empty), promise;
	  if(sub)test.constructor = function(exec){
	    exec(empty, empty);
	  };
	  (promise = P.resolve(test))['catch'](empty);
	  return promise === test;
	};
	
	var USE_NATIVE = function(){
	  var works = false;
	  function P2(x){
	    var self = new P(x);
	    setProto(self, P2.prototype);
	    return self;
	  }
	  try {
	    works = P && P.resolve && testResolve();
	    setProto(P2, P);
	    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
	    // actual Firefox has broken subclass support, test that
	    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
	      works = false;
	    }
	    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
	    if(works && __webpack_require__(23)){
	      var thenableThenGotten = false;
	      P.resolve($.setDesc({}, 'then', {
	        get: function(){ thenableThenGotten = true; }
	      }));
	      works = thenableThenGotten;
	    }
	  } catch(e){ works = false; }
	  return works;
	}();
	
	// helpers
	var sameConstructor = function(a, b){
	  // library wrapper special case
	  if(LIBRARY && a === P && b === Wrapper)return true;
	  return same(a, b);
	};
	var getConstructor = function(C){
	  var S = anObject(C)[SPECIES];
	  return S != undefined ? S : C;
	};
	var isThenable = function(it){
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var PromiseCapability = function(C){
	  var resolve, reject;
	  this.promise = new C(function($$resolve, $$reject){
	    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject  = $$reject;
	  });
	  this.resolve = aFunction(resolve),
	  this.reject  = aFunction(reject)
	};
	var perform = function(exec){
	  try {
	    exec();
	  } catch(e){
	    return {error: e};
	  }
	};
	var notify = function(record, isReject){
	  if(record.n)return;
	  record.n = true;
	  var chain = record.c;
	  asap(function(){
	    var value = record.v
	      , ok    = record.s == 1
	      , i     = 0;
	    var run = function(reaction){
	      var handler = ok ? reaction.ok : reaction.fail
	        , resolve = reaction.resolve
	        , reject  = reaction.reject
	        , result, then;
	      try {
	        if(handler){
	          if(!ok)record.h = true;
	          result = handler === true ? value : handler(value);
	          if(result === reaction.promise){
	            reject(TypeError('Promise-chain cycle'));
	          } else if(then = isThenable(result)){
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch(e){
	        reject(e);
	      }
	    };
	    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
	    chain.length = 0;
	    record.n = false;
	    if(isReject)setTimeout(function(){
	      var promise = record.p
	        , handler, console;
	      if(isUnhandled(promise)){
	        if(isNode){
	          process.emit('unhandledRejection', value, promise);
	        } else if(handler = global.onunhandledrejection){
	          handler({promise: promise, reason: value});
	        } else if((console = global.console) && console.error){
	          console.error('Unhandled promise rejection', value);
	        }
	      } record.a = undefined;
	    }, 1);
	  });
	};
	var isUnhandled = function(promise){
	  var record = promise._d
	    , chain  = record.a || record.c
	    , i      = 0
	    , reaction;
	  if(record.h)return false;
	  while(chain.length > i){
	    reaction = chain[i++];
	    if(reaction.fail || !isUnhandled(reaction.promise))return false;
	  } return true;
	};
	var $reject = function(value){
	  var record = this;
	  if(record.d)return;
	  record.d = true;
	  record = record.r || record; // unwrap
	  record.v = value;
	  record.s = 2;
	  record.a = record.c.slice();
	  notify(record, true);
	};
	var $resolve = function(value){
	  var record = this
	    , then;
	  if(record.d)return;
	  record.d = true;
	  record = record.r || record; // unwrap
	  try {
	    if(record.p === value)throw TypeError("Promise can't be resolved itself");
	    if(then = isThenable(value)){
	      asap(function(){
	        var wrapper = {r: record, d: false}; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch(e){
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      record.v = value;
	      record.s = 1;
	      notify(record, false);
	    }
	  } catch(e){
	    $reject.call({r: record, d: false}, e); // wrap
	  }
	};
	
	// constructor polyfill
	if(!USE_NATIVE){
	  // 25.4.3.1 Promise(executor)
	  P = function Promise(executor){
	    aFunction(executor);
	    var record = this._d = {
	      p: strictNew(this, P, PROMISE),         // <- promise
	      c: [],                                  // <- awaiting reactions
	      a: undefined,                           // <- checked in isUnhandled reactions
	      s: 0,                                   // <- state
	      d: false,                               // <- done
	      v: undefined,                           // <- value
	      h: false,                               // <- handled rejection
	      n: false                                // <- notify
	    };
	    try {
	      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
	    } catch(err){
	      $reject.call(record, err);
	    }
	  };
	  __webpack_require__(57)(P.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected){
	      var reaction = new PromiseCapability(speciesConstructor(this, P))
	        , promise  = reaction.promise
	        , record   = this._d;
	      reaction.ok   = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      record.c.push(reaction);
	      if(record.a)record.a.push(reaction);
	      if(record.s)notify(record, false);
	      return promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function(onRejected){
	      return this.then(undefined, onRejected);
	    }
	  });
	}
	
	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: P});
	__webpack_require__(28)(P, PROMISE);
	__webpack_require__(58)(PROMISE);
	Wrapper = __webpack_require__(8)[PROMISE];
	
	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r){
	    var capability = new PromiseCapability(this)
	      , $$reject   = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (!USE_NATIVE || testResolve(true)), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x){
	    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
	    if(x instanceof P && sameConstructor(x.constructor, this))return x;
	    var capability = new PromiseCapability(this)
	      , $$resolve  = capability.resolve;
	    $$resolve(x);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(59)(function(iter){
	  P.all(iter)['catch'](function(){});
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable){
	    var C          = getConstructor(this)
	      , capability = new PromiseCapability(C)
	      , resolve    = capability.resolve
	      , reject     = capability.reject
	      , values     = [];
	    var abrupt = perform(function(){
	      forOf(iterable, false, values.push, values);
	      var remaining = values.length
	        , results   = Array(remaining);
	      if(remaining)$.each.call(values, function(promise, index){
	        var alreadyCalled = false;
	        C.resolve(promise).then(function(value){
	          if(alreadyCalled)return;
	          alreadyCalled = true;
	          results[index] = value;
	          --remaining || resolve(results);
	        }, reject);
	      });
	      else resolve(results);
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable){
	    var C          = getConstructor(this)
	      , capability = new PromiseCapability(C)
	      , reject     = capability.reject;
	    var abrupt = perform(function(){
	      forOf(iterable, false, function(promise){
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if(abrupt)reject(abrupt.error);
	    return capability.promise;
	  }
	});

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(38)
	  , TAG = __webpack_require__(29)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';
	
	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ }),
/* 41 */
/***/ (function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(41);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ }),
/* 43 */
/***/ (function(module, exports) {

	module.exports = function(it, Constructor, name){
	  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
	  return it;
	};

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(9)
	  , call        = __webpack_require__(45)
	  , isArrayIter = __webpack_require__(46)
	  , anObject    = __webpack_require__(42)
	  , toLength    = __webpack_require__(47)
	  , getIterFn   = __webpack_require__(48);
	module.exports = function(iterable, entries, fn, that){
	  var iterFn = getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    call(iterator, f, step.value, entries);
	  }
	};

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(42);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(26)
	  , ITERATOR   = __webpack_require__(29)('iterator')
	  , ArrayProto = Array.prototype;
	
	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(16)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(40)
	  , ITERATOR  = __webpack_require__(29)('iterator')
	  , Iterators = __webpack_require__(26);
	module.exports = __webpack_require__(8).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var getDesc  = __webpack_require__(5).getDesc
	  , isObject = __webpack_require__(41)
	  , anObject = __webpack_require__(42);
	var check = function(O, proto){
	  anObject(O);
	  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function(test, buggy, set){
	      try {
	        set = __webpack_require__(9)(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch(e){ buggy = true; }
	      return function setPrototypeOf(O, proto){
	        check(O, proto);
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

/***/ }),
/* 50 */
/***/ (function(module, exports) {

	// 7.2.9 SameValue(x, y)
	module.exports = Object.is || function is(x, y){
	  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
	};

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject  = __webpack_require__(42)
	  , aFunction = __webpack_require__(10)
	  , SPECIES   = __webpack_require__(29)('species');
	module.exports = function(O, D){
	  var C = anObject(O).constructor, S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(7)
	  , macrotask = __webpack_require__(53).set
	  , Observer  = global.MutationObserver || global.WebKitMutationObserver
	  , process   = global.process
	  , Promise   = global.Promise
	  , isNode    = __webpack_require__(38)(process) == 'process'
	  , head, last, notify;
	
	var flush = function(){
	  var parent, domain, fn;
	  if(isNode && (parent = process.domain)){
	    process.domain = null;
	    parent.exit();
	  }
	  while(head){
	    domain = head.domain;
	    fn     = head.fn;
	    if(domain)domain.enter();
	    fn(); // <- currently we use it only for Promise - try / catch not required
	    if(domain)domain.exit();
	    head = head.next;
	  } last = undefined;
	  if(parent)parent.enter();
	};
	
	// Node.js
	if(isNode){
	  notify = function(){
	    process.nextTick(flush);
	  };
	// browsers with MutationObserver
	} else if(Observer){
	  var toggle = 1
	    , node   = document.createTextNode('');
	  new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
	  notify = function(){
	    node.data = toggle = -toggle;
	  };
	// environments with maybe non-completely correct, but existent Promise
	} else if(Promise && Promise.resolve){
	  notify = function(){
	    Promise.resolve().then(flush);
	  };
	// for other environments - macrotask based on:
	// - setImmediate
	// - MessageChannel
	// - window.postMessag
	// - onreadystatechange
	// - setTimeout
	} else {
	  notify = function(){
	    // strange IE + webpack dev server bug - use .call(global)
	    macrotask.call(global, flush);
	  };
	}
	
	module.exports = function asap(fn){
	  var task = {fn: fn, next: undefined, domain: isNode && process.domain};
	  if(last)last.next = task;
	  if(!head){
	    head = task;
	    notify();
	  } last = task;
	};

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx                = __webpack_require__(9)
	  , invoke             = __webpack_require__(54)
	  , html               = __webpack_require__(55)
	  , cel                = __webpack_require__(56)
	  , global             = __webpack_require__(7)
	  , process            = global.process
	  , setTask            = global.setImmediate
	  , clearTask          = global.clearImmediate
	  , MessageChannel     = global.MessageChannel
	  , counter            = 0
	  , queue              = {}
	  , ONREADYSTATECHANGE = 'onreadystatechange'
	  , defer, channel, port;
	var run = function(){
	  var id = +this;
	  if(queue.hasOwnProperty(id)){
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listner = function(event){
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if(!setTask || !clearTask){
	  setTask = function setImmediate(fn){
	    var args = [], i = 1;
	    while(arguments.length > i)args.push(arguments[i++]);
	    queue[++counter] = function(){
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id){
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if(__webpack_require__(38)(process) == 'process'){
	    defer = function(id){
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if(MessageChannel){
	    channel = new MessageChannel;
	    port    = channel.port2;
	    channel.port1.onmessage = listner;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
	    defer = function(id){
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listner, false);
	  // IE8-
	  } else if(ONREADYSTATECHANGE in cel('script')){
	    defer = function(id){
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function(id){
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set:   setTask,
	  clear: clearTask
	};

/***/ }),
/* 54 */
/***/ (function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function(fn, args, that){
	  var un = that === undefined;
	  switch(args.length){
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return              fn.apply(that, args);
	};

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(7).document && document.documentElement;

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(41)
	  , document = __webpack_require__(7).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	var redefine = __webpack_require__(20);
	module.exports = function(target, src){
	  for(var key in src)redefine(target, key, src[key]);
	  return target;
	};

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var core        = __webpack_require__(8)
	  , $           = __webpack_require__(5)
	  , DESCRIPTORS = __webpack_require__(23)
	  , SPECIES     = __webpack_require__(29)('species');
	
	module.exports = function(KEY){
	  var C = core[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])$.setDesc(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(29)('iterator')
	  , SAFE_CLOSING = false;
	
	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }
	
	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(61), __esModule: true };

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(62);
	module.exports = __webpack_require__(8).Number.isFinite;

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	// 20.1.2.2 Number.isFinite(number)
	var $export   = __webpack_require__(6)
	  , _isFinite = __webpack_require__(7).isFinite;
	
	$export($export.S, 'Number', {
	  isFinite: function isFinite(it){
	    return typeof it == 'number' && _isFinite(it);
	  }
	});

/***/ }),
/* 63 */
/***/ (function(module, exports) {

	"use strict";
	
	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};
	
	exports.__esModule = true;

/***/ }),
/* 64 */
/***/ (function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	var Assert = function Assert(test, message) {
	  if (test) {
	    return;
	  }
	  throw new Error("[Query] " + message);
	};
	
	exports["default"] = Assert;
	module.exports = exports["default"];

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _classCallCheck = __webpack_require__(1)['default'];
	
	exports.__esModule = true;
	function lazy(expression) {
	  // if valid date then cast to ISO string.
	  if (expression instanceof Date && !isNaN(expression.valueOf())) {
	    expression = expression.toISOString();
	  }
	
	  return expression;
	}
	
	function quote(_x) {
	  var _again = true;
	
	  _function: while (_again) {
	    var value = _x;
	    _again = false;
	
	    if (typeof value === 'string') {
	      return '"' + value + '"';
	    } else if (typeof value === 'number') {
	      return value;
	    } else if (Array.isArray(value)) {
	      return value.map(quote);
	    }
	
	    _x = lazy(value);
	    _again = true;
	    continue _function;
	  }
	}
	
	var Filter = (function () {
	  function Filter(context, columnName) {
	    _classCallCheck(this, Filter);
	
	    this._context = context;
	    // Update this to double quotes once the service layer regex is updated with correct syntax parsing
	    this._columnName = '\'' + columnName + '\'';
	    this._expressionArray = [];
	    this._dynamic = null;
	
	    // verbose notation
	    this.lessThan = this.lt;
	    this.lessThanOrEqual = this.lte;
	    this.greaterThan = this.gt;
	    this.greaterThanOrEqual = this.gte;
	  }
	
	  Filter.prototype.dynamic = function dynamic(expression) {
	    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      args[_key - 1] = arguments[_key];
	    }
	
	    this._dynamic = function () {
	      var _operator;
	
	      var operator = typeof expression === 'function' ? expression() : expression;
	      return (_operator = this[operator]).call.apply(_operator, [this].concat(args));
	    };
	    return this._context;
	  };
	
	  Filter.prototype.lt = function lt(value) {
	    this._expressionArray = [this._columnName, ' < ', quote(value)];
	    return this._context;
	  };
	
	  Filter.prototype.lte = function lte(value) {
	    this._expressionArray = [this._columnName, ' <= ', quote(value)];
	    return this._context;
	  };
	
	  Filter.prototype.gt = function gt(value) {
	    this._expressionArray = [this._columnName, ' > ', quote(value)];
	    return this._context;
	  };
	
	  Filter.prototype.gte = function gte(value) {
	    this._expressionArray = [this._columnName, ' >= ', quote(value)];
	    return this._context;
	  };
	
	  Filter.prototype.isNull = function isNull() {
	    this._expressionArray = [this._columnName, ' is null'];
	    return this._context;
	  };
	
	  Filter.prototype.isNotNull = function isNotNull() {
	    this._expressionArray = [this._columnName, ' !is null'];
	    return this._context;
	  };
	
	  Filter.prototype.equals = function equals(value) {
	    this._expressionArray = [this._columnName, ' == ', quote(value)];
	    return this._context;
	  };
	
	  Filter.prototype.notEquals = function notEquals(value) {
	    this._expressionArray = [this._columnName, ' != ', quote(value)];
	    return this._context;
	  };
	
	  Filter.prototype.between = function between(start, end) {
	    this._expressionArray = [this._columnName, ' >= ', quote(start), ', ', this._columnName, ' <= ', quote(end)];
	    return this._context;
	  };
	
	  Filter.prototype.like = function like(value) {
	    console.warn('[Query]: using `like` is the same as using `contains`');
	    return this.contains(value);
	  };
	
	  Filter.prototype.notLike = function notLike(value) {
	    console.warn('[Query]: using `like` is the same as using `contains`');
	    return this.notContains(value);
	  };
	
	  Filter.prototype.contains = function contains(value) {
	    this._expressionArray = [this._columnName, ' contains ', quote(value)];
	    return this._context;
	  };
	
	  Filter.prototype.notContains = function notContains(value) {
	    this._expressionArray = [this._columnName, ' !contains ', quote(value)];
	    return this._context;
	  };
	
	  Filter.prototype['in'] = function _in(args) {
	    var arr = typeof args === 'function' || Array.isArray(args) ? args : arguments;
	    this._expressionArray = [this._columnName, ' in ', '[', quote(arr), ']'];
	    return this._context;
	  };
	
	  Filter.prototype.notIn = function notIn(args) {
	    var arr = typeof args === 'function' || Array.isArray(args) ? args : arguments;
	    this._expressionArray = [this._columnName, ' !in ', '[', quote(arr), ']'];
	    return this._context;
	  };
	
	  Filter.prototype.query = function query() {
	    if (this._dynamic) {
	      this._dynamic();
	    }
	    return this._expressionArray.map(lazy).map(encodeURIComponent).join('');
	  };
	
	  return Filter;
	})();
	
	exports['default'] = Filter;
	module.exports = exports['default'];

/***/ })
/******/ ])
});
;
//# sourceMappingURL=query.js.map