if (!Array.isArray) {
    Array.isArray = function (arg)
    {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}
//------------------------------------------------------------------------
// Console-polyfill. MIT license.
// https://github.com/paulmillr/console-polyfill
// Make it safe to do console.log() always.
(function (global)
{
    'use strict';
    if (!global.console) {
        global.console = {};
    }
    var con = global.console;
    var prop, method;
    var dummy = function () { };
    var properties = ['memory'];
    var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
       'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
       'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
    while (prop = properties.pop()) if (!con[prop]) con[prop] = {};
    while (method = methods.pop()) if (typeof con[method] !== 'function') con[method] = dummy;
    // Using `this` for web workers & supports Browserify / Webpack.
})(typeof window === 'undefined' ? this : window);

//------------------------------------------------------------------------
// https://gist.github.com/juliocesar/926500
// I mean, seriously, localStorage is supported even by your mum. How about instead of
// casing the feature out, you give users in-memory (stale) storage instead?
if (!('localStorage' in window)) {
    window.localStorage = {
        _data: {},
        setItem: function (id, val) { return this._data[id] = String(val); },
        getItem: function (id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
        removeItem: function (id) { return delete this._data[id]; },
        clear: function () { return this._data = {}; }
    };
}

//------------------------------------------------------------------------
/*
URLSearchParams Polyfill 
https://github.com/WebReflection/url-search-params
Usage: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
*/
var URLSearchParams = URLSearchParams || (function ()
{
    'use strict';

    function encode(str)
    {
        return encodeURIComponent(str).replace(find, replacer);
    }

    function decode(str)
    {
        return decodeURIComponent(str.replace(plus, ' '));
    }

    function URLSearchParams(query)
    {
        this[secret] = Object.create(null);
        if (!query) return;
        if (query.charAt(0) === '?') {
            query = query.slice(1);
        }
        for (var
          index, value,
          pairs = (query || '').split('&'),
          i = 0,
          length = pairs.length; i < length; i++
        ) {
            value = pairs[i];
            index = value.indexOf('=');
            if (-1 < index) {
                this.append(
                  decode(value.slice(0, index)),
                  decode(value.slice(index + 1))
                );
            } else if (value.length) {
                this.append(
                  decode(value),
                  ''
                );
            }
        }
    }

    var
      URLSearchParamsProto = URLSearchParams.prototype,
      find = /[!'\(\)~]|%20|%00/g,
      plus = /\+/g,
      replace = {
          '!': '%21',
          "'": '%27',
          '(': '%28',
          ')': '%29',
          '~': '%7E',
          '%20': '+',
          '%00': '\x00'
      },
      replacer = function (match)
      {
          return replace[match];
      },
      iterable = isIterable(),
      secret = '__URLSearchParams__:' + Math.random()
    ;

    function isIterable()
    {
        try {
            return !!Symbol.iterator;
        } catch (error) {
            return false;
        }
    }

    URLSearchParamsProto.append = function append(name, value)
    {
        var dict = this[secret];
        if (name in dict) {
            dict[name].push('' + value);
        } else {
            dict[name] = ['' + value];
        }
    };

    URLSearchParamsProto.delete = function del(name)
    {
        delete this[secret][name];
    };

    URLSearchParamsProto.get = function get(name)
    {
        var dict = this[secret];
        return name in dict ? dict[name][0] : null;
    };

    URLSearchParamsProto.getAll = function getAll(name)
    {
        var dict = this[secret];
        return name in dict ? dict[name].slice(0) : [];
    };

    URLSearchParamsProto.has = function has(name)
    {
        return name in this[secret];
    };

    URLSearchParamsProto.set = function set(name, value)
    {
        this[secret][name] = ['' + value];
    };

    URLSearchParamsProto.forEach = function forEach(callback, thisArg)
    {
        var dict = this[secret];
        Object.getOwnPropertyNames(dict).forEach(function (name)
        {
            dict[name].forEach(function (value)
            {
                callback.call(thisArg, value, name, this);
            }, this);
        }, this);
    };

    URLSearchParamsProto.keys = function keys()
    {
        var items = [];
        this.forEach(function (value, name) { items.push(name); });
        var iterator = {
            next: function ()
            {
                var value = items.shift();
                return { done: value === undefined, value: value };
            }
        };

        if (iterable) {
            iterator[Symbol.iterator] = function ()
            {
                return iterator;
            };
        }

        return iterator;
    };

    URLSearchParamsProto.values = function values()
    {
        var items = [];
        this.forEach(function (value) { items.push(value); });
        var iterator = {
            next: function ()
            {
                var value = items.shift();
                return { done: value === undefined, value: value };
            }
        };

        if (iterable) {
            iterator[Symbol.iterator] = function ()
            {
                return iterator;
            };
        }

        return iterator;
    };

    URLSearchParamsProto.entries = function entries()
    {
        var items = [];
        this.forEach(function (value, name) { items.push([name, value]); });
        var iterator = {
            next: function ()
            {
                var value = items.shift();
                return { done: value === undefined, value: value };
            }
        };

        if (iterable) {
            iterator[Symbol.iterator] = function ()
            {
                return iterator;
            };
        }

        return iterator;
    };

    if (iterable) {
        URLSearchParamsProto[Symbol.iterator] = URLSearchParamsProto.entries;
    }


    URLSearchParamsProto.toJSON = function toJSON()
    {
        return {};
    };

    URLSearchParamsProto.toString = function toString()
    {
        var dict = this[secret], query = [], i, key, name, value;
        for (key in dict) {
            name = encode(key);
            for (
              i = 0,
              value = dict[key];
              i < value.length; i++
            ) {
                query.push(name + '=' + encode(value[i]));
            }
        }
        return query.join('&');
    };
    var
      dP = Object.defineProperty,
      gOPD = Object.getOwnPropertyDescriptor,
      createSearchParamsPollute = function (search)
      {
          /*jshint validthis:true */
          function append(name, value)
          {
              URLSearchParamsProto.append.call(this, name, value);
              name = this.toString();
              search.set.call(this._usp, name ? ('?' + name) : '');
          }
          function del(name)
          {
              URLSearchParamsProto.delete.call(this, name);
              name = this.toString();
              search.set.call(this._usp, name ? ('?' + name) : '');
          }
          function set(name, value)
          {
              URLSearchParamsProto.set.call(this, name, value);
              name = this.toString();
              search.set.call(this._usp, name ? ('?' + name) : '');
          }
          return function (sp, value)
          {
              sp.append = append;
              sp.delete = del;
              sp.set = set;
              return dP(sp, '_usp', {
                  configurable: true,
                  writable: true,
                  value: value
              });
          };
      },
      createSearchParamsCreate = function (polluteSearchParams)
      {
          return function (obj, sp)
          {
              dP(
                obj, '_searchParams', {
                    configurable: true,
                    writable: true,
                    value: polluteSearchParams(sp, obj)
                }
              );
              return sp;
          };
      },
      updateSearchParams = function (sp)
      {
          var append = sp.append;
          sp.append = URLSearchParamsProto.append;
          URLSearchParams.call(sp, sp._usp.search.slice(1));
          sp.append = append;
      },
      verifySearchParams = function (obj, Class)
      {
          if (!(obj instanceof Class)) throw new TypeError(
            "'searchParams' accessed on an object that " +
            "does not implement interface " + Class.name
          );
      },
      upgradeClass = function (Class)
      {
          var
            ClassProto = Class.prototype,
            searchParams = gOPD(ClassProto, 'searchParams'),
            href = gOPD(ClassProto, 'href'),
            search = gOPD(ClassProto, 'search'),
            createSearchParams
          ;
          if (!searchParams && search && search.set) {
              createSearchParams = createSearchParamsCreate(
                createSearchParamsPollute(search)
              );
              Object.defineProperties(
                ClassProto,
                {
                    href: {
                        get: function ()
                        {
                            return href.get.call(this);
                        },
                        set: function (value)
                        {
                            var sp = this._searchParams;
                            href.set.call(this, value);
                            if (sp) updateSearchParams(sp);
                        }
                    },
                    search: {
                        get: function ()
                        {
                            return search.get.call(this);
                        },
                        set: function (value)
                        {
                            var sp = this._searchParams;
                            search.set.call(this, value);
                            if (sp) updateSearchParams(sp);
                        }
                    },
                    searchParams: {
                        get: function ()
                        {
                            verifySearchParams(this, Class);
                            return this._searchParams || createSearchParams(
                              this,
                              new URLSearchParams(this.search.slice(1))
                            );
                        },
                        set: function (sp)
                        {
                            verifySearchParams(this, Class);
                            createSearchParams(this, sp);
                        }
                    }
                }
              );
          }

      }
    ;
    upgradeClass(HTMLAnchorElement);
    if (/^function|object$/.test(typeof URL) && URL.prototype) upgradeClass(URL);


    return URLSearchParams;
}());


//------------------------------------------------------------------------

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function ()
{
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                                   || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element)
        {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id)
        {
            clearTimeout(id);
        };
}());