/*!
 * Vue.js v2.4.1
 * (c) 2014-2017 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.Vue = factory());
}(this, (function () {
    'use strict';

    /*  */

// these helpers produces better vm code in JS engines due to their
// explicitness and function inlining
    function isUndef(v) {
        return v === undefined || v === null
    }

    function isDef(v) {
        return v !== undefined && v !== null
    }

    function isTrue(v) {
        return v === true
    }

    function isFalse(v) {
        return v === false
    }

    /**
     * Check if value is primitive
     */
    function isPrimitive(value) {
        return typeof value === 'string' || typeof value === 'number'
    }

    /**
     * Quick object check - this is primarily used to tell
     * Objects from primitive values when we know the value
     * is a JSON-compliant type.
     */
    function isObject(obj) {
        return obj !== null && typeof obj === 'object'
    }

    var _toString = Object.prototype.toString;

    /**
     * Strict object type check. Only returns true
     * for plain JavaScript objects.
     */
    function isPlainObject(obj) {
        return _toString.call(obj) === '[object Object]'
    }

    function isRegExp(v) {
        return _toString.call(v) === '[object RegExp]'
    }

    /**
     * Check if val is a valid array index.
     */
    function isValidArrayIndex(val) {
        var n = parseFloat(val);
        return n >= 0 && Math.floor(n) === n && isFinite(val)
    }

    /**
     * Convert a value to a string that is actually rendered.
     */
    function toString(val) {
        return val == null
            ? ''
            : typeof val === 'object'
                ? JSON.stringify(val, null, 2)
                : String(val)
    }

    /**
     * Convert a input value to a number for persistence.
     * If the conversion fails, return original string.
     */
    function toNumber(val) {
        var n = parseFloat(val);
        return isNaN(n) ? val : n
    }

    /**
     * Make a map and return a function for checking if a key
     * is in that map.
     */
    function makeMap(
        str,
        expectsLowerCase
    ) {
        var map = Object.create(null);
        var list = str.split(',');
        for (var i = 0; i < list.length; i++) {
            map[list[i]] = true;
        }
        return expectsLowerCase
            ? function (val) {
                return map[val.toLowerCase()];
            }
            : function (val) {
                return map[val];
            }
    }

    /**
     * Check if a tag is a built-in tag.
     */
    var isBuiltInTag = makeMap('slot,component', true);

    /**
     * Check if a attribute is a reserved attribute.
     */
    var isReservedAttribute = makeMap('key,ref,slot,is');

    /**
     * Remove an item from an array
     */
    function remove(arr, item) {
        if (arr.length) {
            var index = arr.indexOf(item);
            if (index > -1) {
                return arr.splice(index, 1)
            }
        }
    }

    /**
     * Check whether the object has the property.
     */
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function hasOwn(obj, key) {
        return hasOwnProperty.call(obj, key)
    }

    /**
     * Create a cached version of a pure function.
     */
    function cached(fn) {
        var cache = Object.create(null);
        return (function cachedFn(str) {
            var hit = cache[str];
            return hit || (cache[str] = fn(str))
        })
    }

    /**
     * Camelize a hyphen-delimited string.
     */
    var camelizeRE = /-(\w)/g;
    var camelize = cached(function (str) {
        return str.replace(camelizeRE, function (_, c) {
            return c ? c.toUpperCase() : '';
        })
    });

    /**
     * Capitalize a string.
     */
    var capitalize = cached(function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    });

    /**
     * Hyphenate a camelCase string.
     */
    var hyphenateRE = /([^-])([A-Z])/g;
    var hyphenate = cached(function (str) {
        return str
            .replace(hyphenateRE, '$1-$2')
            .replace(hyphenateRE, '$1-$2')
            .toLowerCase()
    });

    /**
     * Simple bind, faster than native
     */
    function bind(fn, ctx) {
        function boundFn(a) {
            var l = arguments.length;
            return l
                ? l > 1
                    ? fn.apply(ctx, arguments)
                    : fn.call(ctx, a)
                : fn.call(ctx)
        }

        // record original fn length
        boundFn._length = fn.length;
        return boundFn
    }

    /**
     * Convert an Array-like object to a real Array.
     */
    function toArray(list, start) {
        start = start || 0;
        var i = list.length - start;
        var ret = new Array(i);
        while (i--) {
            ret[i] = list[i + start];
        }
        return ret
    }

    /**
     * Mix properties into target object.
     */
    function extend(to, _from) {
        for (var key in _from) {
            to[key] = _from[key];
        }
        return to
    }

    /**
     * Merge an Array of Objects into a single Object.
     */
    function toObject(arr) {
        var res = {};
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) {
                extend(res, arr[i]);
            }
        }
        return res
    }

    /**
     * Perform no operation.
     * Stubbing args to make Flow happy without leaving useless transpiled code
     * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
     */
    function noop(a, b, c) {
    }

    /**
     * Always return false.
     */
    var no = function (a, b, c) {
        return false;
    };

    /**
     * Return same value
     */
    var identity = function (_) {
        return _;
    };

    /**
     * Generate a static keys string from compiler modules.
     */
    function genStaticKeys(modules) {
        return modules.reduce(function (keys, m) {
            return keys.concat(m.staticKeys || [])
        }, []).join(',')
    }

    /**
     * Check if two values are loosely equal - that is,
     * if they are plain objects, do they have the same shape?
     */
    function looseEqual(a, b) {
        var isObjectA = isObject(a);
        var isObjectB = isObject(b);
        if (isObjectA && isObjectB) {
            try {
                return JSON.stringify(a) === JSON.stringify(b)
            } catch (e) {
                // possible circular reference
                return a === b
            }
        } else if (!isObjectA && !isObjectB) {
            return String(a) === String(b)
        } else {
            return false
        }
    }

    function looseIndexOf(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (looseEqual(arr[i], val)) {
                return i
            }
        }
        return -1
    }

    /**
     * Ensure a function is called only once.
     */
    function once(fn) {
        var called = false;
        return function () {
            if (!called) {
                called = true;
                fn.apply(this, arguments);
            }
        }
    }

    var SSR_ATTR = 'data-server-rendered';

    var ASSET_TYPES = [
        'component',
        'directive',
        'filter'
    ];

    var LIFECYCLE_HOOKS = [
        'beforeCreate',
        'created',
        'beforeMount',
        'mounted',
        'beforeUpdate',
        'updated',
        'beforeDestroy',
        'destroyed',
        'activated',
        'deactivated'
    ];

    /*  */

    var config = ({
        /**
         * Option merge strategies (used in core/util/options)
         */
        optionMergeStrategies: Object.create(null),

        /**
         * Whether to suppress warnings.
         */
        silent: false,

        /**
         * Show production mode tip message on boot?
         */
        productionTip: "development" !== 'production',

        /**
         * Whether to enable devtools
         */
        devtools: "development" !== 'production',

        /**
         * Whether to record perf
         */
        performance: false,

        /**
         * Error handler for watcher errors
         */
        errorHandler: null,

        /**
         * Warn handler for watcher warns
         */
        warnHandler: null,

        /**
         * Ignore certain custom elements
         */
        ignoredElements: [],

        /**
         * Custom user key aliases for v-on
         */
        keyCodes: Object.create(null),

        /**
         * Check if a tag is reserved so that it cannot be registered as a
         * component. This is platform-dependent and may be overwritten.
         */
        isReservedTag: no,

        /**
         * Check if an attribute is reserved so that it cannot be used as a component
         * prop. This is platform-dependent and may be overwritten.
         */
        isReservedAttr: no,

        /**
         * Check if a tag is an unknown element.
         * Platform-dependent.
         */
        isUnknownElement: no,

        /**
         * Get the namespace of an element
         */
        getTagNamespace: noop,

        /**
         * Parse the real tag name for the specific platform.
         */
        parsePlatformTagName: identity,

        /**
         * Check if an attribute must be bound using property, e.g. value
         * Platform-dependent.
         */
        mustUseProp: no,

        /**
         * Exposed for legacy reasons
         */
        _lifecycleHooks: LIFECYCLE_HOOKS
    });

    /*  */

    var emptyObject = Object.freeze({});

    /**
     * Check if a string starts with $ or _
     */
    function isReserved(str) {
        var c = (str + '').charCodeAt(0);
        return c === 0x24 || c === 0x5F
    }

    /**
     * Define a property.
     */
    function def(obj, key, val, enumerable) {
        Object.defineProperty(obj, key, {
            value: val,
            enumerable: !!enumerable,
            writable: true,
            configurable: true
        });
    }

    /**
     * Parse simple path.
     */
    var bailRE = /[^\w.$]/;

    function parsePath(path) {
        if (bailRE.test(path)) {
            return
        }
        var segments = path.split('.');
        return function (obj) {
            for (var i = 0; i < segments.length; i++) {
                if (!obj) {
                    return
                }
                obj = obj[segments[i]];
            }
            return obj
        }
    }

    /*  */

    var warn = noop;
    var tip = noop;
    var formatComponentName = (null); // work around flow check

    {
        var hasConsole = typeof console !== 'undefined';
        var classifyRE = /(?:^|[-_])(\w)/g;
        var classify = function (str) {
            return str
                .replace(classifyRE, function (c) {
                    return c.toUpperCase();
                })
                .replace(/[-_]/g, '');
        };

        warn = function (msg, vm) {
            var trace = vm ? generateComponentTrace(vm) : '';

            if (config.warnHandler) {
                config.warnHandler.call(null, msg, vm, trace);
            } else if (hasConsole && (!config.silent)) {
                console.error(("[Vue warn]: " + msg + trace));
            }
        };

        tip = function (msg, vm) {
            if (hasConsole && (!config.silent)) {
                console.warn("[Vue tip]: " + msg + (
                    vm ? generateComponentTrace(vm) : ''
                ));
            }
        };

        formatComponentName = function (vm, includeFile) {
            if (vm.$root === vm) {
                return '<Root>'
            }
            var name = typeof vm === 'string'
                ? vm
                : typeof vm === 'function' && vm.options
                    ? vm.options.name
                    : vm._isVue
                        ? vm.$options.name || vm.$options._componentTag
                        : vm.name;

            var file = vm._isVue && vm.$options.__file;
            if (!name && file) {
                var match = file.match(/([^/\\]+)\.vue$/);
                name = match && match[1];
            }

            return (
                (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
                (file && includeFile !== false ? (" at " + file) : '')
            )
        };

        var repeat = function (str, n) {
            var res = '';
            while (n) {
                if (n % 2 === 1) {
                    res += str;
                }
                if (n > 1) {
                    str += str;
                }
                n >>= 1;
            }
            return res
        };

        var generateComponentTrace = function (vm) {
            if (vm._isVue && vm.$parent) {
                var tree = [];
                var currentRecursiveSequence = 0;
                while (vm) {
                    if (tree.length > 0) {
                        var last = tree[tree.length - 1];
                        if (last.constructor === vm.constructor) {
                            currentRecursiveSequence++;
                            vm = vm.$parent;
                            continue
                        } else if (currentRecursiveSequence > 0) {
                            tree[tree.length - 1] = [last, currentRecursiveSequence];
                            currentRecursiveSequence = 0;
                        }
                    }
                    tree.push(vm);
                    vm = vm.$parent;
                }
                return '\n\nfound in\n\n' + tree
                    .map(function (vm, i) {
                        return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
                            ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
                            : formatComponentName(vm)));
                    })
                    .join('\n')
            } else {
                return ("\n\n(found in " + (formatComponentName(vm)) + ")")
            }
        };
    }

    /*  */

    function handleError(err, vm, info) {
        if (config.errorHandler) {
            config.errorHandler.call(null, err, vm, info);
        } else {
            {
                warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
            }
            /* istanbul ignore else */
            if (inBrowser && typeof console !== 'undefined') {
                console.error(err);
            } else {
                throw err
            }
        }
    }

    /*  */
    /* globals MutationObserver */

// can we use __proto__?
    var hasProto = '__proto__' in {};

// Browser environment sniffing
    var inBrowser = typeof window !== 'undefined';
    var UA = inBrowser && window.navigator.userAgent.toLowerCase();
    var isIE = UA && /msie|trident/.test(UA);
    var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
    var isEdge = UA && UA.indexOf('edge/') > 0;
    var isAndroid = UA && UA.indexOf('android') > 0;
    var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
    var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// Firefix has a "watch" function on Object.prototype...
    var nativeWatch = ({}).watch;

    var supportsPassive = false;
    if (inBrowser) {
        try {
            var opts = {};
            Object.defineProperty(opts, 'passive', ({
                get: function get() {
                    /* istanbul ignore next */
                    supportsPassive = true;
                }
            })); // https://github.com/facebook/flow/issues/285
            window.addEventListener('test-passive', null, opts);
        } catch (e) {
        }
    }

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
    var _isServer;
    var isServerRendering = function () {
        if (_isServer === undefined) {
            /* istanbul ignore if */
            if (!inBrowser && typeof global !== 'undefined') {
                // detect presence of vue-server-renderer and avoid
                // Webpack shimming the process
                _isServer = global['process'].env.VUE_ENV === 'server';
            } else {
                _isServer = false;
            }
        }
        return _isServer
    };

// detect devtools
    var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

    /* istanbul ignore next */
    function isNative(Ctor) {
        return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
    }

    var hasSymbol =
        typeof Symbol !== 'undefined' && isNative(Symbol) &&
        typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

    /**
     * Defer a task to execute it asynchronously.
     */
    var nextTick = (function () {
        var callbacks = [];
        var pending = false;
        var timerFunc;

        function nextTickHandler() {
            pending = false;
            var copies = callbacks.slice(0);
            callbacks.length = 0;
            for (var i = 0; i < copies.length; i++) {
                copies[i]();
            }
        }

        // the nextTick behavior leverages the microtask queue, which can be accessed
        // via either native Promise.then or MutationObserver.
        // MutationObserver has wider support, however it is seriously bugged in
        // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
        // completely stops working after triggering a few times... so, if native
        // Promise is available, we will use it:
        /* istanbul ignore if */
        if (typeof Promise !== 'undefined' && isNative(Promise)) {
            var p = Promise.resolve();
            var logError = function (err) {
                console.error(err);
            };
            timerFunc = function () {
                p.then(nextTickHandler).catch(logError);
                // in problematic UIWebViews, Promise.then doesn't completely break, but
                // it can get stuck in a weird state where callbacks are pushed into the
                // microtask queue but the queue isn't being flushed, until the browser
                // needs to do some other work, e.g. handle a timer. Therefore we can
                // "force" the microtask queue to be flushed by adding an empty timer.
                if (isIOS) {
                    setTimeout(noop);
                }
            };
        } else if (typeof MutationObserver !== 'undefined' && (
            isNative(MutationObserver) ||
            // PhantomJS and iOS 7.x
            MutationObserver.toString() === '[object MutationObserverConstructor]'
        )) {
            // use MutationObserver where native Promise is not available,
            // e.g. PhantomJS IE11, iOS7, Android 4.4
            var counter = 1;
            var observer = new MutationObserver(nextTickHandler);
            var textNode = document.createTextNode(String(counter));
            observer.observe(textNode, {
                characterData: true
            });
            timerFunc = function () {
                counter = (counter + 1) % 2;
                textNode.data = String(counter);
            };
        } else {
            // fallback to setTimeout
            /* istanbul ignore next */
            timerFunc = function () {
                setTimeout(nextTickHandler, 0);
            };
        }

        return function queueNextTick(cb, ctx) {
            var _resolve;
            callbacks.push(function () {
                if (cb) {
                    try {
                        cb.call(ctx);
                    } catch (e) {
                        handleError(e, ctx, 'nextTick');
                    }
                } else if (_resolve) {
                    _resolve(ctx);
                }
            });
            if (!pending) {
                pending = true;
                timerFunc();
            }
            if (!cb && typeof Promise !== 'undefined') {
                return new Promise(function (resolve, reject) {
                    _resolve = resolve;
                })
            }
        }
    })();

    var _Set;
    /* istanbul ignore if */
    if (typeof Set !== 'undefined' && isNative(Set)) {
        // use native Set when available.
        _Set = Set;
    } else {
        // a non-standard Set polyfill that only works with primitive keys.
        _Set = (function () {
            function Set() {
                this.set = Object.create(null);
            }

            Set.prototype.has = function has(key) {
                return this.set[key] === true
            };
            Set.prototype.add = function add(key) {
                this.set[key] = true;
            };
            Set.prototype.clear = function clear() {
                this.set = Object.create(null);
            };

            return Set;
        }());
    }

    /*  */


    var uid = 0;

    /**
     * A dep is an observable that can have multiple
     * directives subscribing to it.
     */
    var Dep = function Dep() {
        this.id = uid++;
        this.subs = [];
    };

    Dep.prototype.addSub = function addSub(sub) {
        this.subs.push(sub);
    };

    Dep.prototype.removeSub = function removeSub(sub) {
        remove(this.subs, sub);
    };

    Dep.prototype.depend = function depend() {
        if (Dep.target) {
            Dep.target.addDep(this);
        }
    };

    Dep.prototype.notify = function notify() {
        // stabilize the subscriber list first
        var subs = this.subs.slice();
        for (var i = 0, l = subs.length; i < l; i++) {
            subs[i].update();
        }
    };

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
    Dep.target = null;
    var targetStack = [];

    function pushTarget(_target) {
        if (Dep.target) {
            targetStack.push(Dep.target);
        }
        Dep.target = _target;
    }

    function popTarget() {
        Dep.target = targetStack.pop();
    }

    /*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

    var arrayProto = Array.prototype;
    var arrayMethods = Object.create(arrayProto);
    [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'sort',
        'reverse'
    ]
        .forEach(function (method) {
            // cache original method
            var original = arrayProto[method];
            def(arrayMethods, method, function mutator() {
                var args = [], len = arguments.length;
                while (len--) args[len] = arguments[len];

                var result = original.apply(this, args);
                var ob = this.__ob__;
                var inserted;
                switch (method) {
                    case 'push':
                    case 'unshift':
                        inserted = args;
                        break
                    case 'splice':
                        inserted = args.slice(2);
                        break
                }
                if (inserted) {
                    ob.observeArray(inserted);
                }
                // notify change
                ob.dep.notify();
                return result
            });
        });

    /*  */

    var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

    /**
     * By default, when a reactive property is set, the new value is
     * also converted to become reactive. However when passing down props,
     * we don't want to force conversion because the value may be a nested value
     * under a frozen data structure. Converting it would defeat the optimization.
     */
    var observerState = {
        shouldConvert: true
    };

    /**
     * Observer class that are attached to each observed
     * object. Once attached, the observer converts target
     * object's property keys into getter/setters that
     * collect dependencies and dispatches updates.
     */
    var Observer = function Observer(value) {
        this.value = value;
        this.dep = new Dep();
        this.vmCount = 0;
        def(value, '__ob__', this);
        if (Array.isArray(value)) {
            var augment = hasProto
                ? protoAugment
                : copyAugment;
            augment(value, arrayMethods, arrayKeys);
            this.observeArray(value);
        } else {
            this.walk(value);
        }
    };

    /**
     * Walk through each property and convert them into
     * getter/setters. This method should only be called when
     * value type is Object.
     */
    Observer.prototype.walk = function walk(obj) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            defineReactive$$1(obj, keys[i], obj[keys[i]]);
        }
    };

    /**
     * Observe a list of Array items.
     */
    Observer.prototype.observeArray = function observeArray(items) {
        for (var i = 0, l = items.length; i < l; i++) {
            observe(items[i]);
        }
    };

// helpers

    /**
     * Augment an target Object or Array by intercepting
     * the prototype chain using __proto__
     */
    function protoAugment(target, src, keys) {
        /* eslint-disable no-proto */
        target.__proto__ = src;
        /* eslint-enable no-proto */
    }

    /**
     * Augment an target Object or Array by defining
     * hidden properties.
     */

    /* istanbul ignore next */
    function copyAugment(target, src, keys) {
        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            def(target, key, src[key]);
        }
    }

    /**
     * Attempt to create an observer instance for a value,
     * returns the new observer if successfully observed,
     * or the existing observer if the value already has one.
     */
    function observe(value, asRootData) {
        if (!isObject(value)) {
            return
        }
        var ob;
        if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
            ob = value.__ob__;
        } else if (
            observerState.shouldConvert &&
            !isServerRendering() &&
            (Array.isArray(value) || isPlainObject(value)) &&
            Object.isExtensible(value) &&
            !value._isVue
        ) {
            ob = new Observer(value);
        }
        if (asRootData && ob) {
            ob.vmCount++;
        }
        return ob
    }

    /**
     * Define a reactive property on an Object.
     */
    function defineReactive$$1(
        obj,
        key,
        val,
        customSetter,
        shallow
    ) {
        var dep = new Dep();

        var property = Object.getOwnPropertyDescriptor(obj, key);
        if (property && property.configurable === false) {
            return
        }

        // cater for pre-defined getter/setters
        var getter = property && property.get;
        var setter = property && property.set;

        var childOb = !shallow && observe(val);
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function reactiveGetter() {
                var value = getter ? getter.call(obj) : val;
                if (Dep.target) {
                    dep.depend();
                    if (childOb) {
                        childOb.dep.depend();
                    }
                    if (Array.isArray(value)) {
                        dependArray(value);
                    }
                }
                return value
            },
            set: function reactiveSetter(newVal) {
                var value = getter ? getter.call(obj) : val;
                /* eslint-disable no-self-compare */
                if (newVal === value || (newVal !== newVal && value !== value)) {
                    return
                }
                /* eslint-enable no-self-compare */
                if ("development" !== 'production' && customSetter) {
                    customSetter();
                }
                if (setter) {
                    setter.call(obj, newVal);
                } else {
                    val = newVal;
                }
                childOb = !shallow && observe(newVal);
                dep.notify();
            }
        });
    }

    /**
     * Set a property on an object. Adds the new property and
     * triggers change notification if the property doesn't
     * already exist.
     */
    function set(target, key, val) {
        if (Array.isArray(target) && isValidArrayIndex(key)) {
            target.length = Math.max(target.length, key);
            target.splice(key, 1, val);
            return val
        }
        if (hasOwn(target, key)) {
            target[key] = val;
            return val
        }
        var ob = (target).__ob__;
        if (target._isVue || (ob && ob.vmCount)) {
            "development" !== 'production' && warn(
                'Avoid adding reactive properties to a Vue instance or its root $data ' +
                'at runtime - declare it upfront in the data option.'
            );
            return val
        }
        if (!ob) {
            target[key] = val;
            return val
        }
        defineReactive$$1(ob.value, key, val);
        ob.dep.notify();
        return val
    }

    /**
     * Delete a property and trigger change if necessary.
     */
    function del(target, key) {
        if (Array.isArray(target) && isValidArrayIndex(key)) {
            target.splice(key, 1);
            return
        }
        var ob = (target).__ob__;
        if (target._isVue || (ob && ob.vmCount)) {
            "development" !== 'production' && warn(
                'Avoid deleting properties on a Vue instance or its root $data ' +
                '- just set it to null.'
            );
            return
        }
        if (!hasOwn(target, key)) {
            return
        }
        delete target[key];
        if (!ob) {
            return
        }
        ob.dep.notify();
    }

    /**
     * Collect dependencies on array elements when the array is touched, since
     * we cannot intercept array element access like property getters.
     */
    function dependArray(value) {
        for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
            if (Array.isArray(e)) {
                dependArray(e);
            }
        }
    }

    /*  */

    /**
     * Option overwriting strategies are functions that handle
     * how to merge a parent option value and a child option
     * value into the final value.
     */
    var strats = config.optionMergeStrategies;

    /**
     * Options with restrictions
     */
    {
        strats.el = strats.propsData = function (parent, child, vm, key) {
            if (!vm) {
                warn(
                    "option \"" + key + "\" can only be used during instance " +
                    'creation with the `new` keyword.'
                );
            }
            return defaultStrat(parent, child)
        };
    }

    /**
     * Helper that recursively merges two data objects together.
     */
    function mergeData(to, from) {
        if (!from) {
            return to
        }
        var key, toVal, fromVal;
        var keys = Object.keys(from);
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            toVal = to[key];
            fromVal = from[key];
            if (!hasOwn(to, key)) {
                set(to, key, fromVal);
            } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
                mergeData(toVal, fromVal);
            }
        }
        return to
    }

    /**
     * Data
     */
    function mergeDataOrFn(
        parentVal,
        childVal,
        vm
    ) {
        if (!vm) {
            // in a Vue.extend merge, both should be functions
            if (!childVal) {
                return parentVal
            }
            if (!parentVal) {
                return childVal
            }
            // when parentVal & childVal are both present,
            // we need to return a function that returns the
            // merged result of both functions... no need to
            // check if parentVal is a function here because
            // it has to be a function to pass previous merges.
            return function mergedDataFn() {
                return mergeData(
                    typeof childVal === 'function' ? childVal.call(this) : childVal,
                    parentVal.call(this)
                )
            }
        } else if (parentVal || childVal) {
            return function mergedInstanceDataFn() {
                // instance merge
                var instanceData = typeof childVal === 'function'
                    ? childVal.call(vm)
                    : childVal;
                var defaultData = typeof parentVal === 'function'
                    ? parentVal.call(vm)
                    : undefined;
                if (instanceData) {
                    return mergeData(instanceData, defaultData)
                } else {
                    return defaultData
                }
            }
        }
    }

    strats.data = function (
        parentVal,
        childVal,
        vm
    ) {
        if (!vm) {
            if (childVal && typeof childVal !== 'function') {
                "development" !== 'production' && warn(
                    'The "data" option should be a function ' +
                    'that returns a per-instance value in component ' +
                    'definitions.',
                    vm
                );

                return parentVal
            }
            return mergeDataOrFn.call(this, parentVal, childVal)
        }

        return mergeDataOrFn(parentVal, childVal, vm)
    };

    /**
     * Hooks and props are merged as arrays.
     */
    function mergeHook(
        parentVal,
        childVal
    ) {
        return childVal
            ? parentVal
                ? parentVal.concat(childVal)
                : Array.isArray(childVal)
                    ? childVal
                    : [childVal]
            : parentVal
    }

    LIFECYCLE_HOOKS.forEach(function (hook) {
        strats[hook] = mergeHook;
    });

    /**
     * Assets
     *
     * When a vm is present (instance creation), we need to do
     * a three-way merge between constructor options, instance
     * options and parent options.
     */
    function mergeAssets(parentVal, childVal) {
        var res = Object.create(parentVal || null);
        return childVal
            ? extend(res, childVal)
            : res
    }

    ASSET_TYPES.forEach(function (type) {
        strats[type + 's'] = mergeAssets;
    });

    /**
     * Watchers.
     *
     * Watchers hashes should not overwrite one
     * another, so we merge them as arrays.
     */
    strats.watch = function (parentVal, childVal) {
        // work around Firefox's Object.prototype.watch...
        if (parentVal === nativeWatch) {
            parentVal = undefined;
        }
        if (childVal === nativeWatch) {
            childVal = undefined;
        }
        /* istanbul ignore if */
        if (!childVal) {
            return Object.create(parentVal || null)
        }
        if (!parentVal) {
            return childVal
        }
        var ret = {};
        extend(ret, parentVal);
        for (var key in childVal) {
            var parent = ret[key];
            var child = childVal[key];
            if (parent && !Array.isArray(parent)) {
                parent = [parent];
            }
            ret[key] = parent
                ? parent.concat(child)
                : Array.isArray(child) ? child : [child];
        }
        return ret
    };

    /**
     * Other object hashes.
     */
    strats.props =
        strats.methods =
            strats.inject =
                strats.computed = function (parentVal, childVal) {
                    if (!childVal) {
                        return Object.create(parentVal || null)
                    }
                    if (!parentVal) {
                        return childVal
                    }
                    var ret = Object.create(null);
                    extend(ret, parentVal);
                    extend(ret, childVal);
                    return ret
                };
    strats.provide = mergeDataOrFn;

    /**
     * Default strategy.
     */
    var defaultStrat = function (parentVal, childVal) {
        return childVal === undefined
            ? parentVal
            : childVal
    };

    /**
     * Validate component names
     */
    function checkComponents(options) {
        for (var key in options.components) {
            var lower = key.toLowerCase();
            if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
                warn(
                    'Do not use built-in or reserved HTML elements as component ' +
                    'id: ' + key
                );
            }
        }
    }

    /**
     * Ensure all props option syntax are normalized into the
     * Object-based format.
     */
    function normalizeProps(options) {
        var props = options.props;
        if (!props) {
            return
        }
        var res = {};
        var i, val, name;
        if (Array.isArray(props)) {
            i = props.length;
            while (i--) {
                val = props[i];
                if (typeof val === 'string') {
                    name = camelize(val);
                    res[name] = {type: null};
                } else {
                    warn('props must be strings when using array syntax.');
                }
            }
        } else if (isPlainObject(props)) {
            for (var key in props) {
                val = props[key];
                name = camelize(key);
                res[name] = isPlainObject(val)
                    ? val
                    : {type: val};
            }
        }
        options.props = res;
    }

    /**
     * Normalize all injections into Object-based format
     */
    function normalizeInject(options) {
        var inject = options.inject;
        if (Array.isArray(inject)) {
            var normalized = options.inject = {};
            for (var i = 0; i < inject.length; i++) {
                normalized[inject[i]] = inject[i];
            }
        }
    }

    /**
     * Normalize raw function directives into object format.
     */
    function normalizeDirectives(options) {
        var dirs = options.directives;
        if (dirs) {
            for (var key in dirs) {
                var def = dirs[key];
                if (typeof def === 'function') {
                    dirs[key] = {bind: def, update: def};
                }
            }
        }
    }

    /**
     * Merge two option objects into a new one.
     * Core utility used in both instantiation and inheritance.
     */
    function mergeOptions(
        parent,
        child,
        vm
    ) {
        {
            checkComponents(child);
        }

        if (typeof child === 'function') {
            child = child.options;
        }

        normalizeProps(child);
        normalizeInject(child);
        normalizeDirectives(child);
        var extendsFrom = child.extends;
        if (extendsFrom) {
            parent = mergeOptions(parent, extendsFrom, vm);
        }
        if (child.mixins) {
            for (var i = 0, l = child.mixins.length; i < l; i++) {
                parent = mergeOptions(parent, child.mixins[i], vm);
            }
        }
        var options = {};
        var key;
        for (key in parent) {
            mergeField(key);
        }
        for (key in child) {
            if (!hasOwn(parent, key)) {
                mergeField(key);
            }
        }

        function mergeField(key) {
            var strat = strats[key] || defaultStrat;
            options[key] = strat(parent[key], child[key], vm, key);
        }

        return options
    }

    /**
     * Resolve an asset.
     * This function is used because child instances need access
     * to assets defined in its ancestor chain.
     */
    function resolveAsset(
        options,
        type,
        id,
        warnMissing
    ) {
        /* istanbul ignore if */
        if (typeof id !== 'string') {
            return
        }
        var assets = options[type];
        // check local registration variations first
        if (hasOwn(assets, id)) {
            return assets[id]
        }
        var camelizedId = camelize(id);
        if (hasOwn(assets, camelizedId)) {
            return assets[camelizedId]
        }
        var PascalCaseId = capitalize(camelizedId);
        if (hasOwn(assets, PascalCaseId)) {
            return assets[PascalCaseId]
        }
        // fallback to prototype chain
        var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
        if ("development" !== 'production' && warnMissing && !res) {
            warn(
                'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
                options
            );
        }
        return res
    }

    /*  */

    function validateProp(
        key,
        propOptions,
        propsData,
        vm
    ) {
        var prop = propOptions[key];
        var absent = !hasOwn(propsData, key);
        var value = propsData[key];
        // handle boolean props
        if (isType(Boolean, prop.type)) {
            if (absent && !hasOwn(prop, 'default')) {
                value = false;
            } else if (!isType(String, prop.type) && (value === '' || value === hyphenate(key))) {
                value = true;
            }
        }
        // check default value
        if (value === undefined) {
            value = getPropDefaultValue(vm, prop, key);
            // since the default value is a fresh copy,
            // make sure to observe it.
            var prevShouldConvert = observerState.shouldConvert;
            observerState.shouldConvert = true;
            observe(value);
            observerState.shouldConvert = prevShouldConvert;
        }
        {
            assertProp(prop, key, value, vm, absent);
        }
        return value
    }

    /**
     * Get the default value of a prop.
     */
    function getPropDefaultValue(vm, prop, key) {
        // no default, return undefined
        if (!hasOwn(prop, 'default')) {
            return undefined
        }
        var def = prop.default;
        // warn against non-factory defaults for Object & Array
        if ("development" !== 'production' && isObject(def)) {
            warn(
                'Invalid default value for prop "' + key + '": ' +
                'Props with type Object/Array must use a factory function ' +
                'to return the default value.',
                vm
            );
        }
        // the raw prop value was also undefined from previous render,
        // return previous default value to avoid unnecessary watcher trigger
        if (vm && vm.$options.propsData &&
            vm.$options.propsData[key] === undefined &&
            vm._props[key] !== undefined
        ) {
            return vm._props[key]
        }
        // call factory function for non-Function types
        // a value is Function if its prototype is function even across different execution context
        return typeof def === 'function' && getType(prop.type) !== 'Function'
            ? def.call(vm)
            : def
    }

    /**
     * Assert whether a prop is valid.
     */
    function assertProp(
        prop,
        name,
        value,
        vm,
        absent
    ) {
        if (prop.required && absent) {
            warn(
                'Missing required prop: "' + name + '"',
                vm
            );
            return
        }
        if (value == null && !prop.required) {
            return
        }
        var type = prop.type;
        var valid = !type || type === true;
        var expectedTypes = [];
        if (type) {
            if (!Array.isArray(type)) {
                type = [type];
            }
            for (var i = 0; i < type.length && !valid; i++) {
                var assertedType = assertType(value, type[i]);
                expectedTypes.push(assertedType.expectedType || '');
                valid = assertedType.valid;
            }
        }
        if (!valid) {
            warn(
                'Invalid prop: type check failed for prop "' + name + '".' +
                ' Expected ' + expectedTypes.map(capitalize).join(', ') +
                ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
                vm
            );
            return
        }
        var validator = prop.validator;
        if (validator) {
            if (!validator(value)) {
                warn(
                    'Invalid prop: custom validator check failed for prop "' + name + '".',
                    vm
                );
            }
        }
    }

    var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

    function assertType(value, type) {
        var valid;
        var expectedType = getType(type);
        if (simpleCheckRE.test(expectedType)) {
            valid = typeof value === expectedType.toLowerCase();
        } else if (expectedType === 'Object') {
            valid = isPlainObject(value);
        } else if (expectedType === 'Array') {
            valid = Array.isArray(value);
        } else {
            valid = value instanceof type;
        }
        return {
            valid: valid,
            expectedType: expectedType
        }
    }

    /**
     * Use function string name to check built-in types,
     * because a simple equality check will fail when running
     * across different vms / iframes.
     */
    function getType(fn) {
        var match = fn && fn.toString().match(/^\s*function (\w+)/);
        return match ? match[1] : ''
    }

    function isType(type, fn) {
        if (!Array.isArray(fn)) {
            return getType(fn) === getType(type)
        }
        for (var i = 0, len = fn.length; i < len; i++) {
            if (getType(fn[i]) === getType(type)) {
                return true
            }
        }
        /* istanbul ignore next */
        return false
    }

    /*  */

    var mark;
    var measure;

    {
        var perf = inBrowser && window.performance;
        /* istanbul ignore if */
        if (
            perf &&
            perf.mark &&
            perf.measure &&
            perf.clearMarks &&
            perf.clearMeasures
        ) {
            mark = function (tag) {
                return perf.mark(tag);
            };
            measure = function (name, startTag, endTag) {
                perf.measure(name, startTag, endTag);
                perf.clearMarks(startTag);
                perf.clearMarks(endTag);
                perf.clearMeasures(name);
            };
        }
    }

    /* not type checking this file because flow doesn't play well with Proxy */

    var initProxy;

    {
        var allowedGlobals = makeMap(
            'Infinity,undefined,NaN,isFinite,isNaN,' +
            'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
            'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
            'require' // for Webpack/Browserify
        );

        var warnNonPresent = function (target, key) {
            warn(
                "Property or method \"" + key + "\" is not defined on the instance but " +
                "referenced during render. Make sure to declare reactive data " +
                "properties in the data option.",
                target
            );
        };

        var hasProxy =
            typeof Proxy !== 'undefined' &&
            Proxy.toString().match(/native code/);

        if (hasProxy) {
            var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta');
            config.keyCodes = new Proxy(config.keyCodes, {
                set: function set(target, key, value) {
                    if (isBuiltInModifier(key)) {
                        warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
                        return false
                    } else {
                        target[key] = value;
                        return true
                    }
                }
            });
        }

        var hasHandler = {
            has: function has(target, key) {
                var has = key in target;
                var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
                if (!has && !isAllowed) {
                    warnNonPresent(target, key);
                }
                return has || !isAllowed
            }
        };

        var getHandler = {
            get: function get(target, key) {
                if (typeof key === 'string' && !(key in target)) {
                    warnNonPresent(target, key);
                }
                return target[key]
            }
        };

        initProxy = function initProxy(vm) {
            if (hasProxy) {
                // determine which proxy handler to use
                var options = vm.$options;
                var handlers = options.render && options.render._withStripped
                    ? getHandler
                    : hasHandler;
                vm._renderProxy = new Proxy(vm, handlers);
            } else {
                vm._renderProxy = vm;
            }
        };
    }

    /*  */

    var VNode = function VNode(
        tag,
        data,
        children,
        text,
        elm,
        context,
        componentOptions,
        asyncFactory
    ) {
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
        this.elm = elm;
        this.ns = undefined;
        this.context = context;
        this.functionalContext = undefined;
        this.key = data && data.key;
        this.componentOptions = componentOptions;
        this.componentInstance = undefined;
        this.parent = undefined;
        this.raw = false;
        this.isStatic = false;
        this.isRootInsert = true;
        this.isComment = false;
        this.isCloned = false;
        this.isOnce = false;
        this.asyncFactory = asyncFactory;
        this.asyncMeta = undefined;
        this.isAsyncPlaceholder = false;
    };

    var prototypeAccessors = {child: {}};

// DEPRECATED: alias for componentInstance for backwards compat.
    /* istanbul ignore next */
    prototypeAccessors.child.get = function () {
        return this.componentInstance
    };

    Object.defineProperties(VNode.prototype, prototypeAccessors);

    var createEmptyVNode = function (text) {
        if (text === void 0) text = '';

        var node = new VNode();
        node.text = text;
        node.isComment = true;
        return node
    };

    function createTextVNode(val) {
        return new VNode(undefined, undefined, undefined, String(val))
    }

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
    function cloneVNode(vnode) {
        var cloned = new VNode(
            vnode.tag,
            vnode.data,
            vnode.children,
            vnode.text,
            vnode.elm,
            vnode.context,
            vnode.componentOptions,
            vnode.asyncFactory
        );
        cloned.ns = vnode.ns;
        cloned.isStatic = vnode.isStatic;
        cloned.key = vnode.key;
        cloned.isComment = vnode.isComment;
        cloned.isCloned = true;
        return cloned
    }

    function cloneVNodes(vnodes) {
        var len = vnodes.length;
        var res = new Array(len);
        for (var i = 0; i < len; i++) {
            res[i] = cloneVNode(vnodes[i]);
        }
        return res
    }

    /*  */

    var normalizeEvent = cached(function (name) {
        var passive = name.charAt(0) === '&';
        name = passive ? name.slice(1) : name;
        var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
        name = once$$1 ? name.slice(1) : name;
        var capture = name.charAt(0) === '!';
        name = capture ? name.slice(1) : name;
        return {
            name: name,
            once: once$$1,
            capture: capture,
            passive: passive
        }
    });

    function createFnInvoker(fns) {
        function invoker() {
            var arguments$1 = arguments;

            var fns = invoker.fns;
            if (Array.isArray(fns)) {
                var cloned = fns.slice();
                for (var i = 0; i < cloned.length; i++) {
                    cloned[i].apply(null, arguments$1);
                }
            } else {
                // return handler return value for single handlers
                return fns.apply(null, arguments)
            }
        }

        invoker.fns = fns;
        return invoker
    }

    function updateListeners(
        on,
        oldOn,
        add,
        remove$$1,
        vm
    ) {
        var name, cur, old, event;
        for (name in on) {
            cur = on[name];
            old = oldOn[name];
            event = normalizeEvent(name);
            if (isUndef(cur)) {
                "development" !== 'production' && warn(
                    "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
                    vm
                );
            } else if (isUndef(old)) {
                if (isUndef(cur.fns)) {
                    cur = on[name] = createFnInvoker(cur);
                }
                add(event.name, cur, event.once, event.capture, event.passive);
            } else if (cur !== old) {
                old.fns = cur;
                on[name] = old;
            }
        }
        for (name in oldOn) {
            if (isUndef(on[name])) {
                event = normalizeEvent(name);
                remove$$1(event.name, oldOn[name], event.capture);
            }
        }
    }

    /*  */

    function mergeVNodeHook(def, hookKey, hook) {
        var invoker;
        var oldHook = def[hookKey];

        function wrappedHook() {
            hook.apply(this, arguments);
            // important: remove merged hook to ensure it's called only once
            // and prevent memory leak
            remove(invoker.fns, wrappedHook);
        }

        if (isUndef(oldHook)) {
            // no existing hook
            invoker = createFnInvoker([wrappedHook]);
        } else {
            /* istanbul ignore if */
            if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
                // already a merged invoker
                invoker = oldHook;
                invoker.fns.push(wrappedHook);
            } else {
                // existing plain hook
                invoker = createFnInvoker([oldHook, wrappedHook]);
            }
        }

        invoker.merged = true;
        def[hookKey] = invoker;
    }

    /*  */

    function extractPropsFromVNodeData(
        data,
        Ctor,
        tag
    ) {
        // we are only extracting raw values here.
        // validation and default values are handled in the child
        // component itself.
        var propOptions = Ctor.options.props;
        if (isUndef(propOptions)) {
            return
        }
        var res = {};
        var attrs = data.attrs;
        var props = data.props;
        if (isDef(attrs) || isDef(props)) {
            for (var key in propOptions) {
                var altKey = hyphenate(key);
                {
                    var keyInLowerCase = key.toLowerCase();
                    if (
                        key !== keyInLowerCase &&
                        attrs && hasOwn(attrs, keyInLowerCase)
                    ) {
                        tip(
                            "Prop \"" + keyInLowerCase + "\" is passed to component " +
                            (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
                            " \"" + key + "\". " +
                            "Note that HTML attributes are case-insensitive and camelCased " +
                            "props need to use their kebab-case equivalents when using in-DOM " +
                            "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
                        );
                    }
                }
                checkProp(res, props, key, altKey, true) ||
                checkProp(res, attrs, key, altKey, false);
            }
        }
        return res
    }

    function checkProp(
        res,
        hash,
        key,
        altKey,
        preserve
    ) {
        if (isDef(hash)) {
            if (hasOwn(hash, key)) {
                res[key] = hash[key];
                if (!preserve) {
                    delete hash[key];
                }
                return true
            } else if (hasOwn(hash, altKey)) {
                res[key] = hash[altKey];
                if (!preserve) {
                    delete hash[altKey];
                }
                return true
            }
        }
        return false
    }

    /*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
    function simpleNormalizeChildren(children) {
        for (var i = 0; i < children.length; i++) {
            if (Array.isArray(children[i])) {
                return Array.prototype.concat.apply([], children)
            }
        }
        return children
    }

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
    function normalizeChildren(children) {
        return isPrimitive(children)
            ? [createTextVNode(children)]
            : Array.isArray(children)
                ? normalizeArrayChildren(children)
                : undefined
    }

    function isTextNode(node) {
        return isDef(node) && isDef(node.text) && isFalse(node.isComment)
    }

    function normalizeArrayChildren(children, nestedIndex) {
        var res = [];
        var i, c, last;
        for (i = 0; i < children.length; i++) {
            c = children[i];
            if (isUndef(c) || typeof c === 'boolean') {
                continue
            }
            last = res[res.length - 1];
            //  nested
            if (Array.isArray(c)) {
                res.push.apply(res, normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i)));
            } else if (isPrimitive(c)) {
                if (isTextNode(last)) {
                    // merge adjacent text nodes
                    // this is necessary for SSR hydration because text nodes are
                    // essentially merged when rendered to HTML strings
                    (last).text += String(c);
                } else if (c !== '') {
                    // convert primitive to vnode
                    res.push(createTextVNode(c));
                }
            } else {
                if (isTextNode(c) && isTextNode(last)) {
                    // merge adjacent text nodes
                    res[res.length - 1] = createTextVNode(last.text + c.text);
                } else {
                    // default key for nested array children (likely generated by v-for)
                    if (isTrue(children._isVList) &&
                        isDef(c.tag) &&
                        isUndef(c.key) &&
                        isDef(nestedIndex)) {
                        c.key = "__vlist" + nestedIndex + "_" + i + "__";
                    }
                    res.push(c);
                }
            }
        }
        return res
    }

    /*  */

    function ensureCtor(comp, base) {
        if (comp.__esModule && comp.default) {
            comp = comp.default;
        }
        return isObject(comp)
            ? base.extend(comp)
            : comp
    }

    function createAsyncPlaceholder(
        factory,
        data,
        context,
        children,
        tag
    ) {
        var node = createEmptyVNode();
        node.asyncFactory = factory;
        node.asyncMeta = {data: data, context: context, children: children, tag: tag};
        return node
    }

    function resolveAsyncComponent(
        factory,
        baseCtor,
        context
    ) {
        if (isTrue(factory.error) && isDef(factory.errorComp)) {
            return factory.errorComp
        }

        if (isDef(factory.resolved)) {
            return factory.resolved
        }

        if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
            return factory.loadingComp
        }

        if (isDef(factory.contexts)) {
            // already pending
            factory.contexts.push(context);
        } else {
            var contexts = factory.contexts = [context];
            var sync = true;

            var forceRender = function () {
                for (var i = 0, l = contexts.length; i < l; i++) {
                    contexts[i].$forceUpdate();
                }
            };

            var resolve = once(function (res) {
                // cache resolved
                factory.resolved = ensureCtor(res, baseCtor);
                // invoke callbacks only if this is not a synchronous resolve
                // (async resolves are shimmed as synchronous during SSR)
                if (!sync) {
                    forceRender();
                }
            });

            var reject = once(function (reason) {
                "development" !== 'production' && warn(
                    "Failed to resolve async component: " + (String(factory)) +
                    (reason ? ("\nReason: " + reason) : '')
                );
                if (isDef(factory.errorComp)) {
                    factory.error = true;
                    forceRender();
                }
            });

            var res = factory(resolve, reject);

            if (isObject(res)) {
                if (typeof res.then === 'function') {
                    // () => Promise
                    if (isUndef(factory.resolved)) {
                        res.then(resolve, reject);
                    }
                } else if (isDef(res.component) && typeof res.component.then === 'function') {
                    res.component.then(resolve, reject);

                    if (isDef(res.error)) {
                        factory.errorComp = ensureCtor(res.error, baseCtor);
                    }

                    if (isDef(res.loading)) {
                        factory.loadingComp = ensureCtor(res.loading, baseCtor);
                        if (res.delay === 0) {
                            factory.loading = true;
                        } else {
                            setTimeout(function () {
                                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                                    factory.loading = true;
                                    forceRender();
                                }
                            }, res.delay || 200);
                        }
                    }

                    if (isDef(res.timeout)) {
                        setTimeout(function () {
                            if (isUndef(factory.resolved)) {
                                reject(
                                    "timeout (" + (res.timeout) + "ms)"
                                );
                            }
                        }, res.timeout);
                    }
                }
            }

            sync = false;
            // return in case resolved synchronously
            return factory.loading
                ? factory.loadingComp
                : factory.resolved
        }
    }

    /*  */

    function getFirstComponentChild(children) {
        if (Array.isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                var c = children[i];
                if (isDef(c) && isDef(c.componentOptions)) {
                    return c
                }
            }
        }
    }

    /*  */

    /*  */

    function initEvents(vm) {
        vm._events = Object.create(null);
        vm._hasHookEvent = false;
        // init parent attached events
        var listeners = vm.$options._parentListeners;
        if (listeners) {
            updateComponentListeners(vm, listeners);
        }
    }

    var target;

    function add(event, fn, once$$1) {
        if (once$$1) {
            target.$once(event, fn);
        } else {
            target.$on(event, fn);
        }
    }

    function remove$1(event, fn) {
        target.$off(event, fn);
    }

    function updateComponentListeners(
        vm,
        listeners,
        oldListeners
    ) {
        target = vm;
        updateListeners(listeners, oldListeners || {}, add, remove$1, vm);
    }

    function eventsMixin(Vue) {
        var hookRE = /^hook:/;
        Vue.prototype.$on = function (event, fn) {
            var this$1 = this;

            var vm = this;
            if (Array.isArray(event)) {
                for (var i = 0, l = event.length; i < l; i++) {
                    this$1.$on(event[i], fn);
                }
            } else {
                (vm._events[event] || (vm._events[event] = [])).push(fn);
                // optimize hook:event cost by using a boolean flag marked at registration
                // instead of a hash lookup
                if (hookRE.test(event)) {
                    vm._hasHookEvent = true;
                }
            }
            return vm
        };

        Vue.prototype.$once = function (event, fn) {
            var vm = this;

            function on() {
                vm.$off(event, on);
                fn.apply(vm, arguments);
            }

            on.fn = fn;
            vm.$on(event, on);
            return vm
        };

        Vue.prototype.$off = function (event, fn) {
            var this$1 = this;

            var vm = this;
            // all
            if (!arguments.length) {
                vm._events = Object.create(null);
                return vm
            }
            // array of events
            if (Array.isArray(event)) {
                for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
                    this$1.$off(event[i$1], fn);
                }
                return vm
            }
            // specific event
            var cbs = vm._events[event];
            if (!cbs) {
                return vm
            }
            if (arguments.length === 1) {
                vm._events[event] = null;
                return vm
            }
            // specific handler
            var cb;
            var i = cbs.length;
            while (i--) {
                cb = cbs[i];
                if (cb === fn || cb.fn === fn) {
                    cbs.splice(i, 1);
                    break
                }
            }
            return vm
        };

        Vue.prototype.$emit = function (event) {
            var vm = this;
            {
                var lowerCaseEvent = event.toLowerCase();
                if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
                    tip(
                        "Event \"" + lowerCaseEvent + "\" is emitted in component " +
                        (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
                        "Note that HTML attributes are case-insensitive and you cannot use " +
                        "v-on to listen to camelCase events when using in-DOM templates. " +
                        "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
                    );
                }
            }
            var cbs = vm._events[event];
            if (cbs) {
                cbs = cbs.length > 1 ? toArray(cbs) : cbs;
                var args = toArray(arguments, 1);
                for (var i = 0, l = cbs.length; i < l; i++) {
                    try {
                        cbs[i].apply(vm, args);
                    } catch (e) {
                        handleError(e, vm, ("event handler for \"" + event + "\""));
                    }
                }
            }
            return vm
        };
    }

    /*  */

    /**
     * Runtime helper for resolving raw children VNodes into a slot object.
     */
    function resolveSlots(
        children,
        context
    ) {
        var slots = {};
        if (!children) {
            return slots
        }
        var defaultSlot = [];
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];
            // named slots should only be respected if the vnode was rendered in the
            // same context.
            if ((child.context === context || child.functionalContext === context) &&
                child.data && child.data.slot != null
            ) {
                var name = child.data.slot;
                var slot = (slots[name] || (slots[name] = []));
                if (child.tag === 'template') {
                    slot.push.apply(slot, child.children);
                } else {
                    slot.push(child);
                }
            } else {
                defaultSlot.push(child);
            }
        }
        // ignore whitespace
        if (!defaultSlot.every(isWhitespace)) {
            slots.default = defaultSlot;
        }
        return slots
    }

    function isWhitespace(node) {
        return node.isComment || node.text === ' '
    }

    function resolveScopedSlots(
        fns, // see flow/vnode
        res
    ) {
        res = res || {};
        for (var i = 0; i < fns.length; i++) {
            if (Array.isArray(fns[i])) {
                resolveScopedSlots(fns[i], res);
            } else {
                res[fns[i].key] = fns[i].fn;
            }
        }
        return res
    }

    /*  */

    var activeInstance = null;
    var isUpdatingChildComponent = false;

    function initLifecycle(vm) {
        var options = vm.$options;

        // locate first non-abstract parent
        var parent = options.parent;
        if (parent && !options.abstract) {
            while (parent.$options.abstract && parent.$parent) {
                parent = parent.$parent;
            }
            parent.$children.push(vm);
        }

        vm.$parent = parent;
        vm.$root = parent ? parent.$root : vm;

        vm.$children = [];
        vm.$refs = {};

        vm._watcher = null;
        vm._inactive = null;
        vm._directInactive = false;
        vm._isMounted = false;
        vm._isDestroyed = false;
        vm._isBeingDestroyed = false;
    }

    function lifecycleMixin(Vue) {
        Vue.prototype._update = function (vnode, hydrating) {
            var vm = this;
            if (vm._isMounted) {
                callHook(vm, 'beforeUpdate');
            }
            var prevEl = vm.$el;
            var prevVnode = vm._vnode;
            var prevActiveInstance = activeInstance;
            activeInstance = vm;
            vm._vnode = vnode;
            // Vue.prototype.__patch__ is injected in entry points
            // based on the rendering backend used.
            if (!prevVnode) {
                // initial render
                vm.$el = vm.__patch__(
                    vm.$el, vnode, hydrating, false /* removeOnly */,
                    vm.$options._parentElm,
                    vm.$options._refElm
                );
                // no need for the ref nodes after initial patch
                // this prevents keeping a detached DOM tree in memory (#5851)
                vm.$options._parentElm = vm.$options._refElm = null;
            } else {
                // updates
                vm.$el = vm.__patch__(prevVnode, vnode);
            }
            activeInstance = prevActiveInstance;
            // update __vue__ reference
            if (prevEl) {
                prevEl.__vue__ = null;
            }
            if (vm.$el) {
                vm.$el.__vue__ = vm;
            }
            // if parent is an HOC, update its $el as well
            if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
                vm.$parent.$el = vm.$el;
            }
            // updated hook is called by the scheduler to ensure that children are
            // updated in a parent's updated hook.
        };

        Vue.prototype.$forceUpdate = function () {
            var vm = this;
            if (vm._watcher) {
                vm._watcher.update();
            }
        };

        Vue.prototype.$destroy = function () {
            var vm = this;
            if (vm._isBeingDestroyed) {
                return
            }
            callHook(vm, 'beforeDestroy');
            vm._isBeingDestroyed = true;
            // remove self from parent
            var parent = vm.$parent;
            if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
                remove(parent.$children, vm);
            }
            // teardown watchers
            if (vm._watcher) {
                vm._watcher.teardown();
            }
            var i = vm._watchers.length;
            while (i--) {
                vm._watchers[i].teardown();
            }
            // remove reference from data ob
            // frozen object may not have observer.
            if (vm._data.__ob__) {
                vm._data.__ob__.vmCount--;
            }
            // call the last hook...
            vm._isDestroyed = true;
            // invoke destroy hooks on current rendered tree
            vm.__patch__(vm._vnode, null);
            // fire destroyed hook
            callHook(vm, 'destroyed');
            // turn off all instance listeners.
            vm.$off();
            // remove __vue__ reference
            if (vm.$el) {
                vm.$el.__vue__ = null;
            }
        };
    }

    function mountComponent(
        vm,
        el,
        hydrating
    ) {
        vm.$el = el;
        if (!vm.$options.render) {
            vm.$options.render = createEmptyVNode;
            {
                /* istanbul ignore if */
                if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
                    vm.$options.el || el) {
                    warn(
                        'You are using the runtime-only build of Vue where the template ' +
                        'compiler is not available. Either pre-compile the templates into ' +
                        'render functions, or use the compiler-included build.',
                        vm
                    );
                } else {
                    warn(
                        'Failed to mount component: template or render function not defined.',
                        vm
                    );
                }
            }
        }
        callHook(vm, 'beforeMount');

        var updateComponent;
        /* istanbul ignore if */
        if ("development" !== 'production' && config.performance && mark) {
            updateComponent = function () {
                var name = vm._name;
                var id = vm._uid;
                var startTag = "vue-perf-start:" + id;
                var endTag = "vue-perf-end:" + id;

                mark(startTag);
                var vnode = vm._render();
                mark(endTag);
                measure((name + " render"), startTag, endTag);

                mark(startTag);
                vm._update(vnode, hydrating);
                mark(endTag);
                measure((name + " patch"), startTag, endTag);
            };
        } else {
            updateComponent = function () {
                vm._update(vm._render(), hydrating);
            };
        }

        vm._watcher = new Watcher(vm, updateComponent, noop);
        hydrating = false;

        // manually mounted instance, call mounted on self
        // mounted is called for render-created child components in its inserted hook
        if (vm.$vnode == null) {
            vm._isMounted = true;
            callHook(vm, 'mounted');
        }
        return vm
    }

    function updateChildComponent(
        vm,
        propsData,
        listeners,
        parentVnode,
        renderChildren
    ) {
        {
            isUpdatingChildComponent = true;
        }

        // determine whether component has slot children
        // we need to do this before overwriting $options._renderChildren
        var hasChildren = !!(
            renderChildren ||               // has new static slots
            vm.$options._renderChildren ||  // has old static slots
            parentVnode.data.scopedSlots || // has new scoped slots
            vm.$scopedSlots !== emptyObject // has old scoped slots
        );

        vm.$options._parentVnode = parentVnode;
        vm.$vnode = parentVnode; // update vm's placeholder node without re-render

        if (vm._vnode) { // update child tree's parent
            vm._vnode.parent = parentVnode;
        }
        vm.$options._renderChildren = renderChildren;

        // update $attrs and $listensers hash
        // these are also reactive so they may trigger child update if the child
        // used them during render
        vm.$attrs = parentVnode.data && parentVnode.data.attrs;
        vm.$listeners = listeners;

        // update props
        if (propsData && vm.$options.props) {
            observerState.shouldConvert = false;
            var props = vm._props;
            var propKeys = vm.$options._propKeys || [];
            for (var i = 0; i < propKeys.length; i++) {
                var key = propKeys[i];
                props[key] = validateProp(key, vm.$options.props, propsData, vm);
            }
            observerState.shouldConvert = true;
            // keep a copy of raw propsData
            vm.$options.propsData = propsData;
        }

        // update listeners
        if (listeners) {
            var oldListeners = vm.$options._parentListeners;
            vm.$options._parentListeners = listeners;
            updateComponentListeners(vm, listeners, oldListeners);
        }
        // resolve slots + force update if has children
        if (hasChildren) {
            vm.$slots = resolveSlots(renderChildren, parentVnode.context);
            vm.$forceUpdate();
        }

        {
            isUpdatingChildComponent = false;
        }
    }

    function isInInactiveTree(vm) {
        while (vm && (vm = vm.$parent)) {
            if (vm._inactive) {
                return true
            }
        }
        return false
    }

    function activateChildComponent(vm, direct) {
        if (direct) {
            vm._directInactive = false;
            if (isInInactiveTree(vm)) {
                return
            }
        } else if (vm._directInactive) {
            return
        }
        if (vm._inactive || vm._inactive === null) {
            vm._inactive = false;
            for (var i = 0; i < vm.$children.length; i++) {
                activateChildComponent(vm.$children[i]);
            }
            callHook(vm, 'activated');
        }
    }

    function deactivateChildComponent(vm, direct) {
        if (direct) {
            vm._directInactive = true;
            if (isInInactiveTree(vm)) {
                return
            }
        }
        if (!vm._inactive) {
            vm._inactive = true;
            for (var i = 0; i < vm.$children.length; i++) {
                deactivateChildComponent(vm.$children[i]);
            }
            callHook(vm, 'deactivated');
        }
    }

    function callHook(vm, hook) {
        var handlers = vm.$options[hook];
        if (handlers) {
            for (var i = 0, j = handlers.length; i < j; i++) {
                try {
                    handlers[i].call(vm);
                } catch (e) {
                    handleError(e, vm, (hook + " hook"));
                }
            }
        }
        if (vm._hasHookEvent) {
            vm.$emit('hook:' + hook);
        }
    }

    /*  */


    var MAX_UPDATE_COUNT = 100;

    var queue = [];
    var activatedChildren = [];
    var has = {};
    var circular = {};
    var waiting = false;
    var flushing = false;
    var index = 0;

    /**
     * Reset the scheduler's state.
     */
    function resetSchedulerState() {
        index = queue.length = activatedChildren.length = 0;
        has = {};
        {
            circular = {};
        }
        waiting = flushing = false;
    }

    /**
     * Flush both queues and run the watchers.
     */
    function flushSchedulerQueue() {
        flushing = true;
        var watcher, id;

        // Sort queue before flush.
        // This ensures that:
        // 1. Components are updated from parent to child. (because parent is always
        //    created before the child)
        // 2. A component's user watchers are run before its render watcher (because
        //    user watchers are created before the render watcher)
        // 3. If a component is destroyed during a parent component's watcher run,
        //    its watchers can be skipped.
        queue.sort(function (a, b) {
            return a.id - b.id;
        });

        // do not cache length because more watchers might be pushed
        // as we run existing watchers
        for (index = 0; index < queue.length; index++) {
            watcher = queue[index];
            id = watcher.id;
            has[id] = null;
            watcher.run();
            // in dev build, check and stop circular updates.
            if ("development" !== 'production' && has[id] != null) {
                circular[id] = (circular[id] || 0) + 1;
                if (circular[id] > MAX_UPDATE_COUNT) {
                    warn(
                        'You may have an infinite update loop ' + (
                            watcher.user
                                ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                                : "in a component render function."
                        ),
                        watcher.vm
                    );
                    break
                }
            }
        }

        // keep copies of post queues before resetting state
        var activatedQueue = activatedChildren.slice();
        var updatedQueue = queue.slice();

        resetSchedulerState();

        // call component updated and activated hooks
        callActivatedHooks(activatedQueue);
        callUpdatedHooks(updatedQueue);

        // devtool hook
        /* istanbul ignore if */
        if (devtools && config.devtools) {
            devtools.emit('flush');
        }
    }

    function callUpdatedHooks(queue) {
        var i = queue.length;
        while (i--) {
            var watcher = queue[i];
            var vm = watcher.vm;
            if (vm._watcher === watcher && vm._isMounted) {
                callHook(vm, 'updated');
            }
        }
    }

    /**
     * Queue a kept-alive component that was activated during patch.
     * The queue will be processed after the entire tree has been patched.
     */
    function queueActivatedComponent(vm) {
        // setting _inactive to false here so that a render function can
        // rely on checking whether it's in an inactive tree (e.g. router-view)
        vm._inactive = false;
        activatedChildren.push(vm);
    }

    function callActivatedHooks(queue) {
        for (var i = 0; i < queue.length; i++) {
            queue[i]._inactive = true;
            activateChildComponent(queue[i], true /* true */);
        }
    }

    /**
     * Push a watcher into the watcher queue.
     * Jobs with duplicate IDs will be skipped unless it's
     * pushed when the queue is being flushed.
     */
    function queueWatcher(watcher) {
        var id = watcher.id;
        if (has[id] == null) {
            has[id] = true;
            if (!flushing) {
                queue.push(watcher);
            } else {
                // if already flushing, splice the watcher based on its id
                // if already past its id, it will be run next immediately.
                var i = queue.length - 1;
                while (i > index && queue[i].id > watcher.id) {
                    i--;
                }
                queue.splice(i + 1, 0, watcher);
            }
            // queue the flush
            if (!waiting) {
                waiting = true;
                nextTick(flushSchedulerQueue);
            }
        }
    }

    /*  */

    var uid$2 = 0;

    /**
     * A watcher parses an expression, collects dependencies,
     * and fires callback when the expression value changes.
     * This is used for both the $watch() api and directives.
     */
    var Watcher = function Watcher(
        vm,
        expOrFn,
        cb,
        options
    ) {
        this.vm = vm;
        vm._watchers.push(this);
        // options
        if (options) {
            this.deep = !!options.deep;
            this.user = !!options.user;
            this.lazy = !!options.lazy;
            this.sync = !!options.sync;
        } else {
            this.deep = this.user = this.lazy = this.sync = false;
        }
        this.cb = cb;
        this.id = ++uid$2; // uid for batching
        this.active = true;
        this.dirty = this.lazy; // for lazy watchers
        this.deps = [];
        this.newDeps = [];
        this.depIds = new _Set();
        this.newDepIds = new _Set();
        this.expression = expOrFn.toString();
        // parse expression for getter
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn;
        } else {
            this.getter = parsePath(expOrFn);
            if (!this.getter) {
                this.getter = function () {
                };
                "development" !== 'production' && warn(
                    "Failed watching path: \"" + expOrFn + "\" " +
                    'Watcher only accepts simple dot-delimited paths. ' +
                    'For full control, use a function instead.',
                    vm
                );
            }
        }
        this.value = this.lazy
            ? undefined
            : this.get();
    };

    /**
     * Evaluate the getter, and re-collect dependencies.
     */
    Watcher.prototype.get = function get() {
        pushTarget(this);
        var value;
        var vm = this.vm;
        try {
            value = this.getter.call(vm, vm);
        } catch (e) {
            if (this.user) {
                handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
            } else {
                throw e
            }
        } finally {
            // "touch" every property so they are all tracked as
            // dependencies for deep watching
            if (this.deep) {
                traverse(value);
            }
            popTarget();
            this.cleanupDeps();
        }
        return value
    };

    /**
     * Add a dependency to this directive.
     */
    Watcher.prototype.addDep = function addDep(dep) {
        var id = dep.id;
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            if (!this.depIds.has(id)) {
                dep.addSub(this);
            }
        }
    };

    /**
     * Clean up for dependency collection.
     */
    Watcher.prototype.cleanupDeps = function cleanupDeps() {
        var this$1 = this;

        var i = this.deps.length;
        while (i--) {
            var dep = this$1.deps[i];
            if (!this$1.newDepIds.has(dep.id)) {
                dep.removeSub(this$1);
            }
        }
        var tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        this.newDepIds.clear();
        tmp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp;
        this.newDeps.length = 0;
    };

    /**
     * Subscriber interface.
     * Will be called when a dependency changes.
     */
    Watcher.prototype.update = function update() {
        /* istanbul ignore else */
        if (this.lazy) {
            this.dirty = true;
        } else if (this.sync) {
            this.run();
        } else {
            queueWatcher(this);
        }
    };

    /**
     * Scheduler job interface.
     * Will be called by the scheduler.
     */
    Watcher.prototype.run = function run() {
        if (this.active) {
            var value = this.get();
            if (
                value !== this.value ||
                // Deep watchers and watchers on Object/Arrays should fire even
                // when the value is the same, because the value may
                // have mutated.
                isObject(value) ||
                this.deep
            ) {
                // set new value
                var oldValue = this.value;
                this.value = value;
                if (this.user) {
                    try {
                        this.cb.call(this.vm, value, oldValue);
                    } catch (e) {
                        handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
                    }
                } else {
                    this.cb.call(this.vm, value, oldValue);
                }
            }
        }
    };

    /**
     * Evaluate the value of the watcher.
     * This only gets called for lazy watchers.
     */
    Watcher.prototype.evaluate = function evaluate() {
        this.value = this.get();
        this.dirty = false;
    };

    /**
     * Depend on all deps collected by this watcher.
     */
    Watcher.prototype.depend = function depend() {
        var this$1 = this;

        var i = this.deps.length;
        while (i--) {
            this$1.deps[i].depend();
        }
    };

    /**
     * Remove self from all dependencies' subscriber list.
     */
    Watcher.prototype.teardown = function teardown() {
        var this$1 = this;

        if (this.active) {
            // remove self from vm's watcher list
            // this is a somewhat expensive operation so we skip it
            // if the vm is being destroyed.
            if (!this.vm._isBeingDestroyed) {
                remove(this.vm._watchers, this);
            }
            var i = this.deps.length;
            while (i--) {
                this$1.deps[i].removeSub(this$1);
            }
            this.active = false;
        }
    };

    /**
     * Recursively traverse an object to evoke all converted
     * getters, so that every nested property inside the object
     * is collected as a "deep" dependency.
     */
    var seenObjects = new _Set();

    function traverse(val) {
        seenObjects.clear();
        _traverse(val, seenObjects);
    }

    function _traverse(val, seen) {
        var i, keys;
        var isA = Array.isArray(val);
        if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
            return
        }
        if (val.__ob__) {
            var depId = val.__ob__.dep.id;
            if (seen.has(depId)) {
                return
            }
            seen.add(depId);
        }
        if (isA) {
            i = val.length;
            while (i--) {
                _traverse(val[i], seen);
            }
        } else {
            keys = Object.keys(val);
            i = keys.length;
            while (i--) {
                _traverse(val[keys[i]], seen);
            }
        }
    }

    /*  */

    var sharedPropertyDefinition = {
        enumerable: true,
        configurable: true,
        get: noop,
        set: noop
    };

    function proxy(target, sourceKey, key) {
        sharedPropertyDefinition.get = function proxyGetter() {
            return this[sourceKey][key]
        };
        sharedPropertyDefinition.set = function proxySetter(val) {
            this[sourceKey][key] = val;
        };
        Object.defineProperty(target, key, sharedPropertyDefinition);
    }

    function initState(vm) {
        vm._watchers = [];
        var opts = vm.$options;
        if (opts.props) {
            initProps(vm, opts.props);
        }
        if (opts.methods) {
            initMethods(vm, opts.methods);
        }
        if (opts.data) {
            initData(vm);
        } else {
            observe(vm._data = {}, true /* asRootData */);
        }
        if (opts.computed) {
            initComputed(vm, opts.computed);
        }
        if (opts.watch && opts.watch !== nativeWatch) {
            initWatch(vm, opts.watch);
        }
    }

    function checkOptionType(vm, name) {
        var option = vm.$options[name];
        if (!isPlainObject(option)) {
            warn(
                ("component option \"" + name + "\" should be an object."),
                vm
            );
        }
    }

    function initProps(vm, propsOptions) {
        var propsData = vm.$options.propsData || {};
        var props = vm._props = {};
        // cache prop keys so that future props updates can iterate using Array
        // instead of dynamic object key enumeration.
        var keys = vm.$options._propKeys = [];
        var isRoot = !vm.$parent;
        // root instance props should be converted
        observerState.shouldConvert = isRoot;
        var loop = function (key) {
            keys.push(key);
            var value = validateProp(key, propsOptions, propsData, vm);
            /* istanbul ignore else */
            {
                if (isReservedAttribute(key) || config.isReservedAttr(key)) {
                    warn(
                        ("\"" + key + "\" is a reserved attribute and cannot be used as component prop."),
                        vm
                    );
                }
                defineReactive$$1(props, key, value, function () {
                    if (vm.$parent && !isUpdatingChildComponent) {
                        warn(
                            "Avoid mutating a prop directly since the value will be " +
                            "overwritten whenever the parent component re-renders. " +
                            "Instead, use a data or computed property based on the prop's " +
                            "value. Prop being mutated: \"" + key + "\"",
                            vm
                        );
                    }
                });
            }
            // static props are already proxied on the component's prototype
            // during Vue.extend(). We only need to proxy props defined at
            // instantiation here.
            if (!(key in vm)) {
                proxy(vm, "_props", key);
            }
        };

        for (var key in propsOptions) loop(key);
        observerState.shouldConvert = true;
    }

    function initData(vm) {
        var data = vm.$options.data;
        data = vm._data = typeof data === 'function'
            ? getData(data, vm)
            : data || {};
        if (!isPlainObject(data)) {
            data = {};
            "development" !== 'production' && warn(
                'data functions should return an object:\n' +
                'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
                vm
            );
        }
        // proxy data on instance
        var keys = Object.keys(data);
        var props = vm.$options.props;
        var methods = vm.$options.methods;
        var i = keys.length;
        while (i--) {
            var key = keys[i];
            {
                if (methods && hasOwn(methods, key)) {
                    warn(
                        ("method \"" + key + "\" has already been defined as a data property."),
                        vm
                    );
                }
            }
            if (props && hasOwn(props, key)) {
                "development" !== 'production' && warn(
                    "The data property \"" + key + "\" is already declared as a prop. " +
                    "Use prop default value instead.",
                    vm
                );
            } else if (!isReserved(key)) {
                proxy(vm, "_data", key);
            }
        }
        // observe data
        observe(data, true /* asRootData */);
    }

    function getData(data, vm) {
        try {
            return data.call(vm)
        } catch (e) {
            handleError(e, vm, "data()");
            return {}
        }
    }

    var computedWatcherOptions = {lazy: true};

    function initComputed(vm, computed) {
        "development" !== 'production' && checkOptionType(vm, 'computed');
        var watchers = vm._computedWatchers = Object.create(null);

        for (var key in computed) {
            var userDef = computed[key];
            var getter = typeof userDef === 'function' ? userDef : userDef.get;
            {
                if (getter === undefined) {
                    warn(
                        ("No getter function has been defined for computed property \"" + key + "\"."),
                        vm
                    );
                    getter = noop;
                }
            }
            // create internal watcher for the computed property.
            watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions);

            // component-defined computed properties are already defined on the
            // component prototype. We only need to define computed properties defined
            // at instantiation here.
            if (!(key in vm)) {
                defineComputed(vm, key, userDef);
            } else {
                if (key in vm.$data) {
                    warn(("The computed property \"" + key + "\" is already defined in data."), vm);
                } else if (vm.$options.props && key in vm.$options.props) {
                    warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
                }
            }
        }
    }

    function defineComputed(target, key, userDef) {
        if (typeof userDef === 'function') {
            sharedPropertyDefinition.get = createComputedGetter(key);
            sharedPropertyDefinition.set = noop;
        } else {
            sharedPropertyDefinition.get = userDef.get
                ? userDef.cache !== false
                    ? createComputedGetter(key)
                    : userDef.get
                : noop;
            sharedPropertyDefinition.set = userDef.set
                ? userDef.set
                : noop;
        }
        Object.defineProperty(target, key, sharedPropertyDefinition);
    }

    function createComputedGetter(key) {
        return function computedGetter() {
            var watcher = this._computedWatchers && this._computedWatchers[key];
            if (watcher) {
                if (watcher.dirty) {
                    watcher.evaluate();
                }
                if (Dep.target) {
                    watcher.depend();
                }
                return watcher.value
            }
        }
    }

    function initMethods(vm, methods) {
        "development" !== 'production' && checkOptionType(vm, 'methods');
        var props = vm.$options.props;
        for (var key in methods) {
            vm[key] = methods[key] == null ? noop : bind(methods[key], vm);
            {
                if (methods[key] == null) {
                    warn(
                        "method \"" + key + "\" has an undefined value in the component definition. " +
                        "Did you reference the function correctly?",
                        vm
                    );
                }
                if (props && hasOwn(props, key)) {
                    warn(
                        ("method \"" + key + "\" has already been defined as a prop."),
                        vm
                    );
                }
            }
        }
    }

    function initWatch(vm, watch) {
        "development" !== 'production' && checkOptionType(vm, 'watch');
        for (var key in watch) {
            var handler = watch[key];
            if (Array.isArray(handler)) {
                for (var i = 0; i < handler.length; i++) {
                    createWatcher(vm, key, handler[i]);
                }
            } else {
                createWatcher(vm, key, handler);
            }
        }
    }

    function createWatcher(
        vm,
        keyOrFn,
        handler,
        options
    ) {
        if (isPlainObject(handler)) {
            options = handler;
            handler = handler.handler;
        }
        if (typeof handler === 'string') {
            handler = vm[handler];
        }
        return vm.$watch(keyOrFn, handler, options)
    }

    function stateMixin(Vue) {
        // flow somehow has problems with directly declared definition object
        // when using Object.defineProperty, so we have to procedurally build up
        // the object here.
        var dataDef = {};
        dataDef.get = function () {
            return this._data
        };
        var propsDef = {};
        propsDef.get = function () {
            return this._props
        };
        {
            dataDef.set = function (newData) {
                warn(
                    'Avoid replacing instance root $data. ' +
                    'Use nested data properties instead.',
                    this
                );
            };
            propsDef.set = function () {
                warn("$props is readonly.", this);
            };
        }
        Object.defineProperty(Vue.prototype, '$data', dataDef);
        Object.defineProperty(Vue.prototype, '$props', propsDef);

        Vue.prototype.$set = set;
        Vue.prototype.$delete = del;

        Vue.prototype.$watch = function (
            expOrFn,
            cb,
            options
        ) {
            var vm = this;
            if (isPlainObject(cb)) {
                return createWatcher(vm, expOrFn, cb, options)
            }
            options = options || {};
            options.user = true;
            var watcher = new Watcher(vm, expOrFn, cb, options);
            if (options.immediate) {
                cb.call(vm, watcher.value);
            }
            return function unwatchFn() {
                watcher.teardown();
            }
        };
    }

    /*  */

    function initProvide(vm) {
        var provide = vm.$options.provide;
        if (provide) {
            vm._provided = typeof provide === 'function'
                ? provide.call(vm)
                : provide;
        }
    }

    function initInjections(vm) {
        var result = resolveInject(vm.$options.inject, vm);
        if (result) {
            observerState.shouldConvert = false;
            Object.keys(result).forEach(function (key) {
                /* istanbul ignore else */
                {
                    defineReactive$$1(vm, key, result[key], function () {
                        warn(
                            "Avoid mutating an injected value directly since the changes will be " +
                            "overwritten whenever the provided component re-renders. " +
                            "injection being mutated: \"" + key + "\"",
                            vm
                        );
                    });
                }
            });
            observerState.shouldConvert = true;
        }
    }

    function resolveInject(inject, vm) {
        if (inject) {
            // inject is :any because flow is not smart enough to figure out cached
            var result = Object.create(null);
            var keys = hasSymbol
                ? Reflect.ownKeys(inject)
                : Object.keys(inject);

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var provideKey = inject[key];
                var source = vm;
                while (source) {
                    if (source._provided && provideKey in source._provided) {
                        result[key] = source._provided[provideKey];
                        break
                    }
                    source = source.$parent;
                }
                if ("development" !== 'production' && !hasOwn(result, key)) {
                    warn(("Injection \"" + key + "\" not found"), vm);
                }
            }
            return result
        }
    }

    /*  */

    function createFunctionalComponent(
        Ctor,
        propsData,
        data,
        context,
        children
    ) {
        var props = {};
        var propOptions = Ctor.options.props;
        if (isDef(propOptions)) {
            for (var key in propOptions) {
                props[key] = validateProp(key, propOptions, propsData || {});
            }
        } else {
            if (isDef(data.attrs)) {
                mergeProps(props, data.attrs);
            }
            if (isDef(data.props)) {
                mergeProps(props, data.props);
            }
        }
        // ensure the createElement function in functional components
        // gets a unique context - this is necessary for correct named slot check
        var _context = Object.create(context);
        var h = function (a, b, c, d) {
            return createElement(_context, a, b, c, d, true);
        };
        var vnode = Ctor.options.render.call(null, h, {
            data: data,
            props: props,
            children: children,
            parent: context,
            listeners: data.on || {},
            injections: resolveInject(Ctor.options.inject, context),
            slots: function () {
                return resolveSlots(children, context);
            }
        });
        if (vnode instanceof VNode) {
            vnode.functionalContext = context;
            vnode.functionalOptions = Ctor.options;
            if (data.slot) {
                (vnode.data || (vnode.data = {})).slot = data.slot;
            }
        }
        return vnode
    }

    function mergeProps(to, from) {
        for (var key in from) {
            to[camelize(key)] = from[key];
        }
    }

    /*  */

// hooks to be invoked on component VNodes during patch
    var componentVNodeHooks = {
        init: function init(
            vnode,
            hydrating,
            parentElm,
            refElm
        ) {
            if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
                var child = vnode.componentInstance = createComponentInstanceForVnode(
                    vnode,
                    activeInstance,
                    parentElm,
                    refElm
                );
                child.$mount(hydrating ? vnode.elm : undefined, hydrating);
            } else if (vnode.data.keepAlive) {
                // kept-alive components, treat as a patch
                var mountedNode = vnode; // work around flow
                componentVNodeHooks.prepatch(mountedNode, mountedNode);
            }
        },

        prepatch: function prepatch(oldVnode, vnode) {
            var options = vnode.componentOptions;
            var child = vnode.componentInstance = oldVnode.componentInstance;
            updateChildComponent(
                child,
                options.propsData, // updated props
                options.listeners, // updated listeners
                vnode, // new parent vnode
                options.children // new children
            );
        },

        insert: function insert(vnode) {
            var context = vnode.context;
            var componentInstance = vnode.componentInstance;
            if (!componentInstance._isMounted) {
                componentInstance._isMounted = true;
                callHook(componentInstance, 'mounted');
            }
            if (vnode.data.keepAlive) {
                if (context._isMounted) {
                    // vue-router#1212
                    // During updates, a kept-alive component's child components may
                    // change, so directly walking the tree here may call activated hooks
                    // on incorrect children. Instead we push them into a queue which will
                    // be processed after the whole patch process ended.
                    queueActivatedComponent(componentInstance);
                } else {
                    activateChildComponent(componentInstance, true /* direct */);
                }
            }
        },

        destroy: function destroy(vnode) {
            var componentInstance = vnode.componentInstance;
            if (!componentInstance._isDestroyed) {
                if (!vnode.data.keepAlive) {
                    componentInstance.$destroy();
                } else {
                    deactivateChildComponent(componentInstance, true /* direct */);
                }
            }
        }
    };

    var hooksToMerge = Object.keys(componentVNodeHooks);

    function createComponent(
        Ctor,
        data,
        context,
        children,
        tag
    ) {
        if (isUndef(Ctor)) {
            return
        }

        var baseCtor = context.$options._base;

        // plain options object: turn it into a constructor
        if (isObject(Ctor)) {
            Ctor = baseCtor.extend(Ctor);
        }

        // if at this stage it's not a constructor or an async component factory,
        // reject.
        if (typeof Ctor !== 'function') {
            {
                warn(("Invalid Component definition: " + (String(Ctor))), context);
            }
            return
        }

        // async component
        var asyncFactory;
        if (isUndef(Ctor.cid)) {
            asyncFactory = Ctor;
            Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
            if (Ctor === undefined) {
                // return a placeholder node for async component, which is rendered
                // as a comment node but preserves all the raw information for the node.
                // the information will be used for async server-rendering and hydration.
                return createAsyncPlaceholder(
                    asyncFactory,
                    data,
                    context,
                    children,
                    tag
                )
            }
        }

        data = data || {};

        // resolve constructor options in case global mixins are applied after
        // component constructor creation
        resolveConstructorOptions(Ctor);

        // transform component v-model data into props & events
        if (isDef(data.model)) {
            transformModel(Ctor.options, data);
        }

        // extract props
        var propsData = extractPropsFromVNodeData(data, Ctor, tag);

        // functional component
        if (isTrue(Ctor.options.functional)) {
            return createFunctionalComponent(Ctor, propsData, data, context, children)
        }

        // keep listeners
        var listeners = data.on;

        if (isTrue(Ctor.options.abstract)) {
            // abstract components do not keep anything
            // other than props & listeners & slot

            // work around flow
            var slot = data.slot;
            data = {};
            if (slot) {
                data.slot = slot;
            }
        }

        // merge component management hooks onto the placeholder node
        mergeHooks(data);

        // return a placeholder vnode
        var name = Ctor.options.name || tag;
        var vnode = new VNode(
            ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
            data, undefined, undefined, undefined, context,
            {Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children},
            asyncFactory
        );
        return vnode
    }

    function createComponentInstanceForVnode(
        vnode, // we know it's MountedComponentVNode but flow doesn't
        parent, // activeInstance in lifecycle state
        parentElm,
        refElm
    ) {
        var vnodeComponentOptions = vnode.componentOptions;
        var options = {
            _isComponent: true,
            parent: parent,
            propsData: vnodeComponentOptions.propsData,
            _componentTag: vnodeComponentOptions.tag,
            _parentVnode: vnode,
            _parentListeners: vnodeComponentOptions.listeners,
            _renderChildren: vnodeComponentOptions.children,
            _parentElm: parentElm || null,
            _refElm: refElm || null
        };
        // check inline-template render functions
        var inlineTemplate = vnode.data.inlineTemplate;
        if (isDef(inlineTemplate)) {
            options.render = inlineTemplate.render;
            options.staticRenderFns = inlineTemplate.staticRenderFns;
        }
        return new vnodeComponentOptions.Ctor(options)
    }

    function mergeHooks(data) {
        if (!data.hook) {
            data.hook = {};
        }
        for (var i = 0; i < hooksToMerge.length; i++) {
            var key = hooksToMerge[i];
            var fromParent = data.hook[key];
            var ours = componentVNodeHooks[key];
            data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
        }
    }

    function mergeHook$1(one, two) {
        return function (a, b, c, d) {
            one(a, b, c, d);
            two(a, b, c, d);
        }
    }

// transform component v-model info (value and callback) into
// prop and event handler respectively.
    function transformModel(options, data) {
        var prop = (options.model && options.model.prop) || 'value';
        var event = (options.model && options.model.event) || 'input';
        (data.props || (data.props = {}))[prop] = data.model.value;
        var on = data.on || (data.on = {});
        if (isDef(on[event])) {
            on[event] = [data.model.callback].concat(on[event]);
        } else {
            on[event] = data.model.callback;
        }
    }

    /*  */

    var SIMPLE_NORMALIZE = 1;
    var ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
    function createElement(
        context,
        tag,
        data,
        children,
        normalizationType,
        alwaysNormalize
    ) {
        if (Array.isArray(data) || isPrimitive(data)) {
            normalizationType = children;
            children = data;
            data = undefined;
        }
        if (isTrue(alwaysNormalize)) {
            normalizationType = ALWAYS_NORMALIZE;
        }
        return _createElement(context, tag, data, children, normalizationType)
    }

    function _createElement(
        context,
        tag,
        data,
        children,
        normalizationType
    ) {
        if (isDef(data) && isDef((data).__ob__)) {
            "development" !== 'production' && warn(
                "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
                'Always create fresh vnode data objects in each render!',
                context
            );
            return createEmptyVNode()
        }
        // object syntax in v-bind
        if (isDef(data) && isDef(data.is)) {
            tag = data.is;
        }
        if (!tag) {
            // in case of component :is set to falsy value
            return createEmptyVNode()
        }
        // warn against non-primitive key
        if ("development" !== 'production' &&
            isDef(data) && isDef(data.key) && !isPrimitive(data.key)
        ) {
            warn(
                'Avoid using non-primitive value as key, ' +
                'use string/number value instead.',
                context
            );
        }
        // support single function children as default scoped slot
        if (Array.isArray(children) &&
            typeof children[0] === 'function'
        ) {
            data = data || {};
            data.scopedSlots = {default: children[0]};
            children.length = 0;
        }
        if (normalizationType === ALWAYS_NORMALIZE) {
            children = normalizeChildren(children);
        } else if (normalizationType === SIMPLE_NORMALIZE) {
            children = simpleNormalizeChildren(children);
        }
        var vnode, ns;
        if (typeof tag === 'string') {
            var Ctor;
            ns = config.getTagNamespace(tag);
            if (config.isReservedTag(tag)) {
                // platform built-in elements
                vnode = new VNode(
                    config.parsePlatformTagName(tag), data, children,
                    undefined, undefined, context
                );
            } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
                // component
                vnode = createComponent(Ctor, data, context, children, tag);
            } else {
                // unknown or unlisted namespaced elements
                // check at runtime because it may get assigned a namespace when its
                // parent normalizes children
                vnode = new VNode(
                    tag, data, children,
                    undefined, undefined, context
                );
            }
        } else {
            // direct component options / constructor
            vnode = createComponent(tag, data, context, children);
        }
        if (isDef(vnode)) {
            if (ns) {
                applyNS(vnode, ns);
            }
            return vnode
        } else {
            return createEmptyVNode()
        }
    }

    function applyNS(vnode, ns) {
        vnode.ns = ns;
        if (vnode.tag === 'foreignObject') {
            // use default namespace inside foreignObject
            return
        }
        if (isDef(vnode.children)) {
            for (var i = 0, l = vnode.children.length; i < l; i++) {
                var child = vnode.children[i];
                if (isDef(child.tag) && isUndef(child.ns)) {
                    applyNS(child, ns);
                }
            }
        }
    }

    /*  */

    /**
     * Runtime helper for rendering v-for lists.
     */
    function renderList(
        val,
        render
    ) {
        var ret, i, l, keys, key;
        if (Array.isArray(val) || typeof val === 'string') {
            ret = new Array(val.length);
            for (i = 0, l = val.length; i < l; i++) {
                ret[i] = render(val[i], i);
            }
        } else if (typeof val === 'number') {
            ret = new Array(val);
            for (i = 0; i < val; i++) {
                ret[i] = render(i + 1, i);
            }
        } else if (isObject(val)) {
            keys = Object.keys(val);
            ret = new Array(keys.length);
            for (i = 0, l = keys.length; i < l; i++) {
                key = keys[i];
                ret[i] = render(val[key], key, i);
            }
        }
        if (isDef(ret)) {
            (ret)._isVList = true;
        }
        return ret
    }

    /*  */

    /**
     * Runtime helper for rendering <slot>
     */
    function renderSlot(
        name,
        fallback,
        props,
        bindObject
    ) {
        var scopedSlotFn = this.$scopedSlots[name];
        if (scopedSlotFn) { // scoped slot
            props = props || {};
            if (bindObject) {
                props = extend(extend({}, bindObject), props);
            }
            return scopedSlotFn(props) || fallback
        } else {
            var slotNodes = this.$slots[name];
            // warn duplicate slot usage
            if (slotNodes && "development" !== 'production') {
                slotNodes._rendered && warn(
                    "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
                    "- this will likely cause render errors.",
                    this
                );
                slotNodes._rendered = true;
            }
            return slotNodes || fallback
        }
    }

    /*  */

    /**
     * Runtime helper for resolving filters
     */
    function resolveFilter(id) {
        return resolveAsset(this.$options, 'filters', id, true) || identity
    }

    /*  */

    /**
     * Runtime helper for checking keyCodes from config.
     */
    function checkKeyCodes(
        eventKeyCode,
        key,
        builtInAlias
    ) {
        var keyCodes = config.keyCodes[key] || builtInAlias;
        if (Array.isArray(keyCodes)) {
            return keyCodes.indexOf(eventKeyCode) === -1
        } else {
            return keyCodes !== eventKeyCode
        }
    }

    /*  */

    /**
     * Runtime helper for merging v-bind="object" into a VNode's data.
     */
    function bindObjectProps(
        data,
        tag,
        value,
        asProp,
        isSync
    ) {
        if (value) {
            if (!isObject(value)) {
                "development" !== 'production' && warn(
                    'v-bind without argument expects an Object or Array value',
                    this
                );
            } else {
                if (Array.isArray(value)) {
                    value = toObject(value);
                }
                var hash;
                var loop = function (key) {
                    if (
                        key === 'class' ||
                        key === 'style' ||
                        isReservedAttribute(key)
                    ) {
                        hash = data;
                    } else {
                        var type = data.attrs && data.attrs.type;
                        hash = asProp || config.mustUseProp(tag, type, key)
                            ? data.domProps || (data.domProps = {})
                            : data.attrs || (data.attrs = {});
                    }
                    if (!(key in hash)) {
                        hash[key] = value[key];

                        if (isSync) {
                            var on = data.on || (data.on = {});
                            on[("update:" + key)] = function ($event) {
                                value[key] = $event;
                            };
                        }
                    }
                };

                for (var key in value) loop(key);
            }
        }
        return data
    }

    /*  */

    /**
     * Runtime helper for rendering static trees.
     */
    function renderStatic(
        index,
        isInFor
    ) {
        var tree = this._staticTrees[index];
        // if has already-rendered static tree and not inside v-for,
        // we can reuse the same tree by doing a shallow clone.
        if (tree && !isInFor) {
            return Array.isArray(tree)
                ? cloneVNodes(tree)
                : cloneVNode(tree)
        }
        // otherwise, render a fresh tree.
        tree = this._staticTrees[index] =
            this.$options.staticRenderFns[index].call(this._renderProxy);
        markStatic(tree, ("__static__" + index), false);
        return tree
    }

    /**
     * Runtime helper for v-once.
     * Effectively it means marking the node as static with a unique key.
     */
    function markOnce(
        tree,
        index,
        key
    ) {
        markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
        return tree
    }

    function markStatic(
        tree,
        key,
        isOnce
    ) {
        if (Array.isArray(tree)) {
            for (var i = 0; i < tree.length; i++) {
                if (tree[i] && typeof tree[i] !== 'string') {
                    markStaticNode(tree[i], (key + "_" + i), isOnce);
                }
            }
        } else {
            markStaticNode(tree, key, isOnce);
        }
    }

    function markStaticNode(node, key, isOnce) {
        node.isStatic = true;
        node.key = key;
        node.isOnce = isOnce;
    }

    /*  */

    function bindObjectListeners(data, value) {
        if (value) {
            if (!isPlainObject(value)) {
                "development" !== 'production' && warn(
                    'v-on without argument expects an Object value',
                    this
                );
            } else {
                var on = data.on = data.on ? extend({}, data.on) : {};
                for (var key in value) {
                    var existing = on[key];
                    var ours = value[key];
                    on[key] = existing ? [].concat(ours, existing) : ours;
                }
            }
        }
        return data
    }

    /*  */

    function initRender(vm) {
        vm._vnode = null; // the root of the child tree
        vm._staticTrees = null;
        var parentVnode = vm.$vnode = vm.$options._parentVnode; // the placeholder node in parent tree
        var renderContext = parentVnode && parentVnode.context;
        vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext);
        vm.$scopedSlots = emptyObject;
        // bind the createElement fn to this instance
        // so that we get proper render context inside it.
        // args order: tag, data, children, normalizationType, alwaysNormalize
        // internal version is used by render functions compiled from templates
        vm._c = function (a, b, c, d) {
            return createElement(vm, a, b, c, d, false);
        };
        // normalization is always applied for the public version, used in
        // user-written render functions.
        vm.$createElement = function (a, b, c, d) {
            return createElement(vm, a, b, c, d, true);
        };

        // $attrs & $listeners are exposed for easier HOC creation.
        // they need to be reactive so that HOCs using them are always updated
        var parentData = parentVnode && parentVnode.data;
        /* istanbul ignore else */
        {
            defineReactive$$1(vm, '$attrs', parentData && parentData.attrs, function () {
                !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
            }, true);
            defineReactive$$1(vm, '$listeners', parentData && parentData.on, function () {
                !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
            }, true);
        }
    }

    function renderMixin(Vue) {
        Vue.prototype.$nextTick = function (fn) {
            return nextTick(fn, this)
        };

        Vue.prototype._render = function () {
            var vm = this;
            var ref = vm.$options;
            var render = ref.render;
            var staticRenderFns = ref.staticRenderFns;
            var _parentVnode = ref._parentVnode;

            if (vm._isMounted) {
                // clone slot nodes on re-renders
                for (var key in vm.$slots) {
                    vm.$slots[key] = cloneVNodes(vm.$slots[key]);
                }
            }

            vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject;

            if (staticRenderFns && !vm._staticTrees) {
                vm._staticTrees = [];
            }
            // set parent vnode. this allows render functions to have access
            // to the data on the placeholder node.
            vm.$vnode = _parentVnode;
            // render self
            var vnode;
            try {
                vnode = render.call(vm._renderProxy, vm.$createElement);
            } catch (e) {
                handleError(e, vm, "render function");
                // return error render result,
                // or previous vnode to prevent render error causing blank component
                /* istanbul ignore else */
                {
                    vnode = vm.$options.renderError
                        ? vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
                        : vm._vnode;
                }
            }
            // return empty vnode in case the render function errored out
            if (!(vnode instanceof VNode)) {
                if ("development" !== 'production' && Array.isArray(vnode)) {
                    warn(
                        'Multiple root nodes returned from render function. Render function ' +
                        'should return a single root node.',
                        vm
                    );
                }
                vnode = createEmptyVNode();
            }
            // set parent
            vnode.parent = _parentVnode;
            return vnode
        };

        // internal render helpers.
        // these are exposed on the instance prototype to reduce generated render
        // code size.
        Vue.prototype._o = markOnce;
        Vue.prototype._n = toNumber;
        Vue.prototype._s = toString;
        Vue.prototype._l = renderList;
        Vue.prototype._t = renderSlot;
        Vue.prototype._q = looseEqual;
        Vue.prototype._i = looseIndexOf;
        Vue.prototype._m = renderStatic;
        Vue.prototype._f = resolveFilter;
        Vue.prototype._k = checkKeyCodes;
        Vue.prototype._b = bindObjectProps;
        Vue.prototype._v = createTextVNode;
        Vue.prototype._e = createEmptyVNode;
        Vue.prototype._u = resolveScopedSlots;
        Vue.prototype._g = bindObjectListeners;
    }

    /*  */

    var uid$1 = 0;

    function initMixin(Vue) {
        Vue.prototype._init = function (options) {
            var vm = this;
            // a uid
            vm._uid = uid$1++;

            var startTag, endTag;
            /* istanbul ignore if */
            if ("development" !== 'production' && config.performance && mark) {
                startTag = "vue-perf-init:" + (vm._uid);
                endTag = "vue-perf-end:" + (vm._uid);
                mark(startTag);
            }

            // a flag to avoid this being observed
            vm._isVue = true;
            // merge options
            if (options && options._isComponent) {
                // optimize internal component instantiation
                // since dynamic options merging is pretty slow, and none of the
                // internal component options needs special treatment.
                initInternalComponent(vm, options);
            } else {
                vm.$options = mergeOptions(
                    resolveConstructorOptions(vm.constructor),
                    options || {},
                    vm
                );
            }
            /* istanbul ignore else */
            {
                initProxy(vm);
            }
            // expose real self
            vm._self = vm;
            initLifecycle(vm);
            initEvents(vm);
            initRender(vm);
            callHook(vm, 'beforeCreate');
            initInjections(vm); // resolve injections before data/props
            initState(vm);
            initProvide(vm); // resolve provide after data/props
            callHook(vm, 'created');

            /* istanbul ignore if */
            if ("development" !== 'production' && config.performance && mark) {
                vm._name = formatComponentName(vm, false);
                mark(endTag);
                measure(((vm._name) + " init"), startTag, endTag);
            }

            if (vm.$options.el) {
                vm.$mount(vm.$options.el);
            }
        };
    }

    function initInternalComponent(vm, options) {
        var opts = vm.$options = Object.create(vm.constructor.options);
        // doing this because it's faster than dynamic enumeration.
        opts.parent = options.parent;
        opts.propsData = options.propsData;
        opts._parentVnode = options._parentVnode;
        opts._parentListeners = options._parentListeners;
        opts._renderChildren = options._renderChildren;
        opts._componentTag = options._componentTag;
        opts._parentElm = options._parentElm;
        opts._refElm = options._refElm;
        if (options.render) {
            opts.render = options.render;
            opts.staticRenderFns = options.staticRenderFns;
        }
    }

    function resolveConstructorOptions(Ctor) {
        var options = Ctor.options;
        if (Ctor.super) {
            var superOptions = resolveConstructorOptions(Ctor.super);
            var cachedSuperOptions = Ctor.superOptions;
            if (superOptions !== cachedSuperOptions) {
                // super option changed,
                // need to resolve new options.
                Ctor.superOptions = superOptions;
                // check if there are any late-modified/attached options (#4976)
                var modifiedOptions = resolveModifiedOptions(Ctor);
                // update base extend options
                if (modifiedOptions) {
                    extend(Ctor.extendOptions, modifiedOptions);
                }
                options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
                if (options.name) {
                    options.components[options.name] = Ctor;
                }
            }
        }
        return options
    }

    function resolveModifiedOptions(Ctor) {
        var modified;
        var latest = Ctor.options;
        var extended = Ctor.extendOptions;
        var sealed = Ctor.sealedOptions;
        for (var key in latest) {
            if (latest[key] !== sealed[key]) {
                if (!modified) {
                    modified = {};
                }
                modified[key] = dedupe(latest[key], extended[key], sealed[key]);
            }
        }
        return modified
    }

    function dedupe(latest, extended, sealed) {
        // compare latest and sealed to ensure lifecycle hooks won't be duplicated
        // between merges
        if (Array.isArray(latest)) {
            var res = [];
            sealed = Array.isArray(sealed) ? sealed : [sealed];
            extended = Array.isArray(extended) ? extended : [extended];
            for (var i = 0; i < latest.length; i++) {
                // push original options and not sealed options to exclude duplicated options
                if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
                    res.push(latest[i]);
                }
            }
            return res
        } else {
            return latest
        }
    }

    function Vue$3(options) {
        if ("development" !== 'production' &&
            !(this instanceof Vue$3)
        ) {
            warn('Vue is a constructor and should be called with the `new` keyword');
        }
        this._init(options);
    }

    initMixin(Vue$3);
    stateMixin(Vue$3);
    eventsMixin(Vue$3);
    lifecycleMixin(Vue$3);
    renderMixin(Vue$3);

    /*  */

    function initUse(Vue) {
        Vue.use = function (plugin) {
            var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
            if (installedPlugins.indexOf(plugin) > -1) {
                return this
            }

            // additional parameters
            var args = toArray(arguments, 1);
            args.unshift(this);
            if (typeof plugin.install === 'function') {
                plugin.install.apply(plugin, args);
            } else if (typeof plugin === 'function') {
                plugin.apply(null, args);
            }
            installedPlugins.push(plugin);
            return this
        };
    }

    /*  */

    function initMixin$1(Vue) {
        Vue.mixin = function (mixin) {
            this.options = mergeOptions(this.options, mixin);
            return this
        };
    }

    /*  */

    function initExtend(Vue) {
        /**
         * Each instance constructor, including Vue, has a unique
         * cid. This enables us to create wrapped "child
         * constructors" for prototypal inheritance and cache them.
         */
        Vue.cid = 0;
        var cid = 1;

        /**
         * Class inheritance
         */
        Vue.extend = function (extendOptions) {
            extendOptions = extendOptions || {};
            var Super = this;
            var SuperId = Super.cid;
            var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
            if (cachedCtors[SuperId]) {
                return cachedCtors[SuperId]
            }

            var name = extendOptions.name || Super.options.name;
            {
                if (!/^[a-zA-Z][\w-]*$/.test(name)) {
                    warn(
                        'Invalid component name: "' + name + '". Component names ' +
                        'can only contain alphanumeric characters and the hyphen, ' +
                        'and must start with a letter.'
                    );
                }
            }

            var Sub = function VueComponent(options) {
                this._init(options);
            };
            Sub.prototype = Object.create(Super.prototype);
            Sub.prototype.constructor = Sub;
            Sub.cid = cid++;
            Sub.options = mergeOptions(
                Super.options,
                extendOptions
            );
            Sub['super'] = Super;

            // For props and computed properties, we define the proxy getters on
            // the Vue instances at extension time, on the extended prototype. This
            // avoids Object.defineProperty calls for each instance created.
            if (Sub.options.props) {
                initProps$1(Sub);
            }
            if (Sub.options.computed) {
                initComputed$1(Sub);
            }

            // allow further extension/mixin/plugin usage
            Sub.extend = Super.extend;
            Sub.mixin = Super.mixin;
            Sub.use = Super.use;

            // create asset registers, so extended classes
            // can have their private assets too.
            ASSET_TYPES.forEach(function (type) {
                Sub[type] = Super[type];
            });
            // enable recursive self-lookup
            if (name) {
                Sub.options.components[name] = Sub;
            }

            // keep a reference to the super options at extension time.
            // later at instantiation we can check if Super's options have
            // been updated.
            Sub.superOptions = Super.options;
            Sub.extendOptions = extendOptions;
            Sub.sealedOptions = extend({}, Sub.options);

            // cache constructor
            cachedCtors[SuperId] = Sub;
            return Sub
        };
    }

    function initProps$1(Comp) {
        var props = Comp.options.props;
        for (var key in props) {
            proxy(Comp.prototype, "_props", key);
        }
    }

    function initComputed$1(Comp) {
        var computed = Comp.options.computed;
        for (var key in computed) {
            defineComputed(Comp.prototype, key, computed[key]);
        }
    }

    /*  */

    function initAssetRegisters(Vue) {
        /**
         * Create asset registration methods.
         */
        ASSET_TYPES.forEach(function (type) {
            Vue[type] = function (
                id,
                definition
            ) {
                if (!definition) {
                    return this.options[type + 's'][id]
                } else {
                    /* istanbul ignore if */
                    {
                        if (type === 'component' && config.isReservedTag(id)) {
                            warn(
                                'Do not use built-in or reserved HTML elements as component ' +
                                'id: ' + id
                            );
                        }
                    }
                    if (type === 'component' && isPlainObject(definition)) {
                        definition.name = definition.name || id;
                        definition = this.options._base.extend(definition);
                    }
                    if (type === 'directive' && typeof definition === 'function') {
                        definition = {bind: definition, update: definition};
                    }
                    this.options[type + 's'][id] = definition;
                    return definition
                }
            };
        });
    }

    /*  */

    var patternTypes = [String, RegExp, Array];

    function getComponentName(opts) {
        return opts && (opts.Ctor.options.name || opts.tag)
    }

    function matches(pattern, name) {
        if (Array.isArray(pattern)) {
            return pattern.indexOf(name) > -1
        } else if (typeof pattern === 'string') {
            return pattern.split(',').indexOf(name) > -1
        } else if (isRegExp(pattern)) {
            return pattern.test(name)
        }
        /* istanbul ignore next */
        return false
    }

    function pruneCache(cache, current, filter) {
        for (var key in cache) {
            var cachedNode = cache[key];
            if (cachedNode) {
                var name = getComponentName(cachedNode.componentOptions);
                if (name && !filter(name)) {
                    if (cachedNode !== current) {
                        pruneCacheEntry(cachedNode);
                    }
                    cache[key] = null;
                }
            }
        }
    }

    function pruneCacheEntry(vnode) {
        if (vnode) {
            vnode.componentInstance.$destroy();
        }
    }

    var KeepAlive = {
        name: 'keep-alive',
        abstract: true,

        props: {
            include: patternTypes,
            exclude: patternTypes
        },

        created: function created() {
            this.cache = Object.create(null);
        },

        destroyed: function destroyed() {
            var this$1 = this;

            for (var key in this$1.cache) {
                pruneCacheEntry(this$1.cache[key]);
            }
        },

        watch: {
            include: function include(val) {
                pruneCache(this.cache, this._vnode, function (name) {
                    return matches(val, name);
                });
            },
            exclude: function exclude(val) {
                pruneCache(this.cache, this._vnode, function (name) {
                    return !matches(val, name);
                });
            }
        },

        render: function render() {
            var vnode = getFirstComponentChild(this.$slots.default);
            var componentOptions = vnode && vnode.componentOptions;
            if (componentOptions) {
                // check pattern
                var name = getComponentName(componentOptions);
                if (name && (
                    (this.include && !matches(this.include, name)) ||
                    (this.exclude && matches(this.exclude, name))
                )) {
                    return vnode
                }
                var key = vnode.key == null
                    // same constructor may get registered as different local components
                    // so cid alone is not enough (#3269)
                    ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
                    : vnode.key;
                if (this.cache[key]) {
                    vnode.componentInstance = this.cache[key].componentInstance;
                } else {
                    this.cache[key] = vnode;
                }
                vnode.data.keepAlive = true;
            }
            return vnode
        }
    };

    var builtInComponents = {
        KeepAlive: KeepAlive
    };

    /*  */

    function initGlobalAPI(Vue) {
        // config
        var configDef = {};
        configDef.get = function () {
            return config;
        };
        {
            configDef.set = function () {
                warn(
                    'Do not replace the Vue.config object, set individual fields instead.'
                );
            };
        }
        Object.defineProperty(Vue, 'config', configDef);

        // exposed util methods.
        // NOTE: these are not considered part of the public API - avoid relying on
        // them unless you are aware of the risk.
        Vue.util = {
            warn: warn,
            extend: extend,
            mergeOptions: mergeOptions,
            defineReactive: defineReactive$$1
        };

        Vue.set = set;
        Vue.delete = del;
        Vue.nextTick = nextTick;

        Vue.options = Object.create(null);
        ASSET_TYPES.forEach(function (type) {
            Vue.options[type + 's'] = Object.create(null);
        });

        // this is used to identify the "base" constructor to extend all plain-object
        // components with in Weex's multi-instance scenarios.
        Vue.options._base = Vue;

        extend(Vue.options.components, builtInComponents);

        initUse(Vue);
        initMixin$1(Vue);
        initExtend(Vue);
        initAssetRegisters(Vue);
    }

    initGlobalAPI(Vue$3);

    Object.defineProperty(Vue$3.prototype, '$isServer', {
        get: isServerRendering
    });

    Object.defineProperty(Vue$3.prototype, '$ssrContext', {
        get: function get() {
            /* istanbul ignore next */
            return this.$vnode && this.$vnode.ssrContext
        }
    });

    Vue$3.version = '2.4.1';

    /*  */

// these are reserved for web because they are directly compiled away
// during template compilation
    var isReservedAttr = makeMap('style,class');

// attributes that should be using props for binding
    var acceptValue = makeMap('input,textarea,option,select');
    var mustUseProp = function (tag, type, attr) {
        return (
            (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
            (attr === 'selected' && tag === 'option') ||
            (attr === 'checked' && tag === 'input') ||
            (attr === 'muted' && tag === 'video')
        )
    };

    var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

    var isBooleanAttr = makeMap(
        'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
        'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
        'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
        'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
        'required,reversed,scoped,seamless,selected,sortable,translate,' +
        'truespeed,typemustmatch,visible'
    );

    var xlinkNS = 'http://www.w3.org/1999/xlink';

    var isXlink = function (name) {
        return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
    };

    var getXlinkProp = function (name) {
        return isXlink(name) ? name.slice(6, name.length) : ''
    };

    var isFalsyAttrValue = function (val) {
        return val == null || val === false
    };

    /*  */

    function genClassForVnode(vnode) {
        var data = vnode.data;
        var parentNode = vnode;
        var childNode = vnode;
        while (isDef(childNode.componentInstance)) {
            childNode = childNode.componentInstance._vnode;
            if (childNode.data) {
                data = mergeClassData(childNode.data, data);
            }
        }
        while (isDef(parentNode = parentNode.parent)) {
            if (parentNode.data) {
                data = mergeClassData(data, parentNode.data);
            }
        }
        return renderClass(data.staticClass, data.class)
    }

    function mergeClassData(child, parent) {
        return {
            staticClass: concat(child.staticClass, parent.staticClass),
            class: isDef(child.class)
                ? [child.class, parent.class]
                : parent.class
        }
    }

    function renderClass(
        staticClass,
        dynamicClass
    ) {
        if (isDef(staticClass) || isDef(dynamicClass)) {
            return concat(staticClass, stringifyClass(dynamicClass))
        }
        /* istanbul ignore next */
        return ''
    }

    function concat(a, b) {
        return a ? b ? (a + ' ' + b) : a : (b || '')
    }

    function stringifyClass(value) {
        if (Array.isArray(value)) {
            return stringifyArray(value)
        }
        if (isObject(value)) {
            return stringifyObject(value)
        }
        if (typeof value === 'string') {
            return value
        }
        /* istanbul ignore next */
        return ''
    }

    function stringifyArray(value) {
        var res = '';
        var stringified;
        for (var i = 0, l = value.length; i < l; i++) {
            if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
                if (res) {
                    res += ' ';
                }
                res += stringified;
            }
        }
        return res
    }

    function stringifyObject(value) {
        var res = '';
        for (var key in value) {
            if (value[key]) {
                if (res) {
                    res += ' ';
                }
                res += key;
            }
        }
        return res
    }

    /*  */

    var namespaceMap = {
        svg: 'http://www.w3.org/2000/svg',
        math: 'http://www.w3.org/1998/Math/MathML'
    };

    var isHTMLTag = makeMap(
        'html,body,base,head,link,meta,style,title,' +
        'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
        'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
        'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
        's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
        'embed,object,param,source,canvas,script,noscript,del,ins,' +
        'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
        'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
        'output,progress,select,textarea,' +
        'details,dialog,menu,menuitem,summary,' +
        'content,element,shadow,template,blockquote,iframe,tfoot'
    );

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
    var isSVG = makeMap(
        'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
        'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
        'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
        true
    );

    var isPreTag = function (tag) {
        return tag === 'pre';
    };

    var isReservedTag = function (tag) {
        return isHTMLTag(tag) || isSVG(tag)
    };

    function getTagNamespace(tag) {
        if (isSVG(tag)) {
            return 'svg'
        }
        // basic support for MathML
        // note it doesn't support other MathML elements being component roots
        if (tag === 'math') {
            return 'math'
        }
    }

    var unknownElementCache = Object.create(null);

    function isUnknownElement(tag) {
        /* istanbul ignore if */
        if (!inBrowser) {
            return true
        }
        if (isReservedTag(tag)) {
            return false
        }
        tag = tag.toLowerCase();
        /* istanbul ignore if */
        if (unknownElementCache[tag] != null) {
            return unknownElementCache[tag]
        }
        var el = document.createElement(tag);
        if (tag.indexOf('-') > -1) {
            // http://stackoverflow.com/a/28210364/1070244
            return (unknownElementCache[tag] = (
                el.constructor === window.HTMLUnknownElement ||
                el.constructor === window.HTMLElement
            ))
        } else {
            return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
        }
    }

    /*  */

    /**
     * Query an element selector if it's not an element already.
     */
    function query(el) {
        if (typeof el === 'string') {
            var selected = document.querySelector(el);
            if (!selected) {
                "development" !== 'production' && warn(
                    'Cannot find element: ' + el
                );
                return document.createElement('div')
            }
            return selected
        } else {
            return el
        }
    }

    /*  */

    function createElement$1(tagName, vnode) {
        var elm = document.createElement(tagName);
        if (tagName !== 'select') {
            return elm
        }
        // false or null will remove the attribute but undefined will not
        if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
            elm.setAttribute('multiple', 'multiple');
        }
        return elm
    }

    function createElementNS(namespace, tagName) {
        return document.createElementNS(namespaceMap[namespace], tagName)
    }

    function createTextNode(text) {
        return document.createTextNode(text)
    }

    function createComment(text) {
        return document.createComment(text)
    }

    function insertBefore(parentNode, newNode, referenceNode) {
        parentNode.insertBefore(newNode, referenceNode);
    }

    function removeChild(node, child) {
        node.removeChild(child);
    }

    function appendChild(node, child) {
        node.appendChild(child);
    }

    function parentNode(node) {
        return node.parentNode
    }

    function nextSibling(node) {
        return node.nextSibling
    }

    function tagName(node) {
        return node.tagName
    }

    function setTextContent(node, text) {
        node.textContent = text;
    }

    function setAttribute(node, key, val) {
        node.setAttribute(key, val);
    }


    var nodeOps = Object.freeze({
        createElement: createElement$1,
        createElementNS: createElementNS,
        createTextNode: createTextNode,
        createComment: createComment,
        insertBefore: insertBefore,
        removeChild: removeChild,
        appendChild: appendChild,
        parentNode: parentNode,
        nextSibling: nextSibling,
        tagName: tagName,
        setTextContent: setTextContent,
        setAttribute: setAttribute
    });

    /*  */

    var ref = {
        create: function create(_, vnode) {
            registerRef(vnode);
        },
        update: function update(oldVnode, vnode) {
            if (oldVnode.data.ref !== vnode.data.ref) {
                registerRef(oldVnode, true);
                registerRef(vnode);
            }
        },
        destroy: function destroy(vnode) {
            registerRef(vnode, true);
        }
    };

    function registerRef(vnode, isRemoval) {
        var key = vnode.data.ref;
        if (!key) {
            return
        }

        var vm = vnode.context;
        var ref = vnode.componentInstance || vnode.elm;
        var refs = vm.$refs;
        if (isRemoval) {
            if (Array.isArray(refs[key])) {
                remove(refs[key], ref);
            } else if (refs[key] === ref) {
                refs[key] = undefined;
            }
        } else {
            if (vnode.data.refInFor) {
                if (!Array.isArray(refs[key])) {
                    refs[key] = [ref];
                } else if (refs[key].indexOf(ref) < 0) {
                    // $flow-disable-line
                    refs[key].push(ref);
                }
            } else {
                refs[key] = ref;
            }
        }
    }

    /**
     * Virtual DOM patching algorithm based on Snabbdom by
     * Simon Friis Vindum (@paldepind)
     * Licensed under the MIT License
     * https://github.com/paldepind/snabbdom/blob/master/LICENSE
     *
     * modified by Evan You (@yyx990803)
     *

     /*
     * Not type-checking this because this file is perf-critical and the cost
     * of making flow understand it is not worth it.
     */

    var emptyNode = new VNode('', {}, []);

    var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

    function sameVnode(a, b) {
        return (
            a.key === b.key && (
                (
                    a.tag === b.tag &&
                    a.isComment === b.isComment &&
                    isDef(a.data) === isDef(b.data) &&
                    sameInputType(a, b)
                ) || (
                    isTrue(a.isAsyncPlaceholder) &&
                    a.asyncFactory === b.asyncFactory &&
                    isUndef(b.asyncFactory.error)
                )
            )
        )
    }

// Some browsers do not support dynamically changing type for <input>
// so they need to be treated as different nodes
    function sameInputType(a, b) {
        if (a.tag !== 'input') {
            return true
        }
        var i;
        var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
        var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
        return typeA === typeB
    }

    function createKeyToOldIdx(children, beginIdx, endIdx) {
        var i, key;
        var map = {};
        for (i = beginIdx; i <= endIdx; ++i) {
            key = children[i].key;
            if (isDef(key)) {
                map[key] = i;
            }
        }
        return map
    }

    function createPatchFunction(backend) {
        var i, j;
        var cbs = {};

        var modules = backend.modules;
        var nodeOps = backend.nodeOps;

        for (i = 0; i < hooks.length; ++i) {
            cbs[hooks[i]] = [];
            for (j = 0; j < modules.length; ++j) {
                if (isDef(modules[j][hooks[i]])) {
                    cbs[hooks[i]].push(modules[j][hooks[i]]);
                }
            }
        }

        function emptyNodeAt(elm) {
            return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
        }

        function createRmCb(childElm, listeners) {
            function remove$$1() {
                if (--remove$$1.listeners === 0) {
                    removeNode(childElm);
                }
            }

            remove$$1.listeners = listeners;
            return remove$$1
        }

        function removeNode(el) {
            var parent = nodeOps.parentNode(el);
            // element may have already been removed due to v-html / v-text
            if (isDef(parent)) {
                nodeOps.removeChild(parent, el);
            }
        }

        var inPre = 0;

        function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested) {
            vnode.isRootInsert = !nested; // for transition enter check
            if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
                return
            }

            var data = vnode.data;
            var children = vnode.children;
            var tag = vnode.tag;
            if (isDef(tag)) {
                {
                    if (data && data.pre) {
                        inPre++;
                    }
                    if (
                        !inPre &&
                        !vnode.ns &&
                        !(config.ignoredElements.length && config.ignoredElements.indexOf(tag) > -1) &&
                        config.isUnknownElement(tag)
                    ) {
                        warn(
                            'Unknown custom element: <' + tag + '> - did you ' +
                            'register the component correctly? For recursive components, ' +
                            'make sure to provide the "name" option.',
                            vnode.context
                        );
                    }
                }
                vnode.elm = vnode.ns
                    ? nodeOps.createElementNS(vnode.ns, tag)
                    : nodeOps.createElement(tag, vnode);
                setScope(vnode);

                /* istanbul ignore if */
                {
                    createChildren(vnode, children, insertedVnodeQueue);
                    if (isDef(data)) {
                        invokeCreateHooks(vnode, insertedVnodeQueue);
                    }
                    insert(parentElm, vnode.elm, refElm);
                }

                if ("development" !== 'production' && data && data.pre) {
                    inPre--;
                }
            } else if (isTrue(vnode.isComment)) {
                vnode.elm = nodeOps.createComment(vnode.text);
                insert(parentElm, vnode.elm, refElm);
            } else {
                vnode.elm = nodeOps.createTextNode(vnode.text);
                insert(parentElm, vnode.elm, refElm);
            }
        }

        function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
            var i = vnode.data;
            if (isDef(i)) {
                var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
                if (isDef(i = i.hook) && isDef(i = i.init)) {
                    i(vnode, false /* hydrating */, parentElm, refElm);
                }
                // after calling the init hook, if the vnode is a child component
                // it should've created a child instance and mounted it. the child
                // component also has set the placeholder vnode's elm.
                // in that case we can just return the element and be done.
                if (isDef(vnode.componentInstance)) {
                    initComponent(vnode, insertedVnodeQueue);
                    if (isTrue(isReactivated)) {
                        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
                    }
                    return true
                }
            }
        }

        function initComponent(vnode, insertedVnodeQueue) {
            if (isDef(vnode.data.pendingInsert)) {
                insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
                vnode.data.pendingInsert = null;
            }
            vnode.elm = vnode.componentInstance.$el;
            if (isPatchable(vnode)) {
                invokeCreateHooks(vnode, insertedVnodeQueue);
                setScope(vnode);
            } else {
                // empty component root.
                // skip all element-related modules except for ref (#3455)
                registerRef(vnode);
                // make sure to invoke the insert hook
                insertedVnodeQueue.push(vnode);
            }
        }

        function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
            var i;
            // hack for #4339: a reactivated component with inner transition
            // does not trigger because the inner node's created hooks are not called
            // again. It's not ideal to involve module-specific logic in here but
            // there doesn't seem to be a better way to do it.
            var innerNode = vnode;
            while (innerNode.componentInstance) {
                innerNode = innerNode.componentInstance._vnode;
                if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
                    for (i = 0; i < cbs.activate.length; ++i) {
                        cbs.activate[i](emptyNode, innerNode);
                    }
                    insertedVnodeQueue.push(innerNode);
                    break
                }
            }
            // unlike a newly created component,
            // a reactivated keep-alive component doesn't insert itself
            insert(parentElm, vnode.elm, refElm);
        }

        function insert(parent, elm, ref$$1) {
            if (isDef(parent)) {
                if (isDef(ref$$1)) {
                    if (ref$$1.parentNode === parent) {
                        nodeOps.insertBefore(parent, elm, ref$$1);
                    }
                } else {
                    nodeOps.appendChild(parent, elm);
                }
            }
        }

        function createChildren(vnode, children, insertedVnodeQueue) {
            if (Array.isArray(children)) {
                for (var i = 0; i < children.length; ++i) {
                    createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
                }
            } else if (isPrimitive(vnode.text)) {
                nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
            }
        }

        function isPatchable(vnode) {
            while (vnode.componentInstance) {
                vnode = vnode.componentInstance._vnode;
            }
            return isDef(vnode.tag)
        }

        function invokeCreateHooks(vnode, insertedVnodeQueue) {
            for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, vnode);
            }
            i = vnode.data.hook; // Reuse variable
            if (isDef(i)) {
                if (isDef(i.create)) {
                    i.create(emptyNode, vnode);
                }
                if (isDef(i.insert)) {
                    insertedVnodeQueue.push(vnode);
                }
            }
        }

        // set scope id attribute for scoped CSS.
        // this is implemented as a special case to avoid the overhead
        // of going through the normal attribute patching process.
        function setScope(vnode) {
            var i;
            var ancestor = vnode;
            while (ancestor) {
                if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
                    nodeOps.setAttribute(vnode.elm, i, '');
                }
                ancestor = ancestor.parent;
            }
            // for slot content they should also get the scopeId from the host instance.
            if (isDef(i = activeInstance) &&
                i !== vnode.context &&
                isDef(i = i.$options._scopeId)
            ) {
                nodeOps.setAttribute(vnode.elm, i, '');
            }
        }

        function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
            for (; startIdx <= endIdx; ++startIdx) {
                createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm);
            }
        }

        function invokeDestroyHook(vnode) {
            var i, j;
            var data = vnode.data;
            if (isDef(data)) {
                if (isDef(i = data.hook) && isDef(i = i.destroy)) {
                    i(vnode);
                }
                for (i = 0; i < cbs.destroy.length; ++i) {
                    cbs.destroy[i](vnode);
                }
            }
            if (isDef(i = vnode.children)) {
                for (j = 0; j < vnode.children.length; ++j) {
                    invokeDestroyHook(vnode.children[j]);
                }
            }
        }

        function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
            for (; startIdx <= endIdx; ++startIdx) {
                var ch = vnodes[startIdx];
                if (isDef(ch)) {
                    if (isDef(ch.tag)) {
                        removeAndInvokeRemoveHook(ch);
                        invokeDestroyHook(ch);
                    } else { // Text node
                        removeNode(ch.elm);
                    }
                }
            }
        }

        function removeAndInvokeRemoveHook(vnode, rm) {
            if (isDef(rm) || isDef(vnode.data)) {
                var i;
                var listeners = cbs.remove.length + 1;
                if (isDef(rm)) {
                    // we have a recursively passed down rm callback
                    // increase the listeners count
                    rm.listeners += listeners;
                } else {
                    // directly removing
                    rm = createRmCb(vnode.elm, listeners);
                }
                // recursively invoke hooks on child component root node
                if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
                    removeAndInvokeRemoveHook(i, rm);
                }
                for (i = 0; i < cbs.remove.length; ++i) {
                    cbs.remove[i](vnode, rm);
                }
                if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
                    i(vnode, rm);
                } else {
                    rm();
                }
            } else {
                removeNode(vnode.elm);
            }
        }

        function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
            var oldStartIdx = 0;
            var newStartIdx = 0;
            var oldEndIdx = oldCh.length - 1;
            var oldStartVnode = oldCh[0];
            var oldEndVnode = oldCh[oldEndIdx];
            var newEndIdx = newCh.length - 1;
            var newStartVnode = newCh[0];
            var newEndVnode = newCh[newEndIdx];
            var oldKeyToIdx, idxInOld, elmToMove, refElm;

            // removeOnly is a special flag used only by <transition-group>
            // to ensure removed elements stay in correct relative positions
            // during leaving transitions
            var canMove = !removeOnly;

            while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                if (isUndef(oldStartVnode)) {
                    oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
                } else if (isUndef(oldEndVnode)) {
                    oldEndVnode = oldCh[--oldEndIdx];
                } else if (sameVnode(oldStartVnode, newStartVnode)) {
                    patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                    oldStartVnode = oldCh[++oldStartIdx];
                    newStartVnode = newCh[++newStartIdx];
                } else if (sameVnode(oldEndVnode, newEndVnode)) {
                    patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newEndVnode = newCh[--newEndIdx];
                } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
                    patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                    canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
                    oldStartVnode = oldCh[++oldStartIdx];
                    newEndVnode = newCh[--newEndIdx];
                } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
                    patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                    canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newStartVnode = newCh[++newStartIdx];
                } else {
                    if (isUndef(oldKeyToIdx)) {
                        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                    }
                    idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null;
                    if (isUndef(idxInOld)) { // New element
                        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
                        newStartVnode = newCh[++newStartIdx];
                    } else {
                        elmToMove = oldCh[idxInOld];
                        /* istanbul ignore if */
                        if ("development" !== 'production' && !elmToMove) {
                            warn(
                                'It seems there are duplicate keys that is causing an update error. ' +
                                'Make sure each v-for item has a unique key.'
                            );
                        }
                        if (sameVnode(elmToMove, newStartVnode)) {
                            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                            oldCh[idxInOld] = undefined;
                            canMove && nodeOps.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                            newStartVnode = newCh[++newStartIdx];
                        } else {
                            // same key but different element. treat as new element
                            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
                            newStartVnode = newCh[++newStartIdx];
                        }
                    }
                }
            }
            if (oldStartIdx > oldEndIdx) {
                refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
                addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            } else if (newStartIdx > newEndIdx) {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }

        function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
            if (oldVnode === vnode) {
                return
            }

            var elm = vnode.elm = oldVnode.elm;

            if (isTrue(oldVnode.isAsyncPlaceholder)) {
                if (isDef(vnode.asyncFactory.resolved)) {
                    hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
                } else {
                    vnode.isAsyncPlaceholder = true;
                }
                return
            }

            // reuse element for static trees.
            // note we only do this if the vnode is cloned -
            // if the new node is not cloned it means the render functions have been
            // reset by the hot-reload-api and we need to do a proper re-render.
            if (isTrue(vnode.isStatic) &&
                isTrue(oldVnode.isStatic) &&
                vnode.key === oldVnode.key &&
                (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
            ) {
                vnode.componentInstance = oldVnode.componentInstance;
                return
            }

            var i;
            var data = vnode.data;
            if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
                i(oldVnode, vnode);
            }

            var oldCh = oldVnode.children;
            var ch = vnode.children;
            if (isDef(data) && isPatchable(vnode)) {
                for (i = 0; i < cbs.update.length; ++i) {
                    cbs.update[i](oldVnode, vnode);
                }
                if (isDef(i = data.hook) && isDef(i = i.update)) {
                    i(oldVnode, vnode);
                }
            }
            if (isUndef(vnode.text)) {
                if (isDef(oldCh) && isDef(ch)) {
                    if (oldCh !== ch) {
                        updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
                    }
                } else if (isDef(ch)) {
                    if (isDef(oldVnode.text)) {
                        nodeOps.setTextContent(elm, '');
                    }
                    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
                } else if (isDef(oldCh)) {
                    removeVnodes(elm, oldCh, 0, oldCh.length - 1);
                } else if (isDef(oldVnode.text)) {
                    nodeOps.setTextContent(elm, '');
                }
            } else if (oldVnode.text !== vnode.text) {
                nodeOps.setTextContent(elm, vnode.text);
            }
            if (isDef(data)) {
                if (isDef(i = data.hook) && isDef(i = i.postpatch)) {
                    i(oldVnode, vnode);
                }
            }
        }

        function invokeInsertHook(vnode, queue, initial) {
            // delay insert hooks for component root nodes, invoke them after the
            // element is really inserted
            if (isTrue(initial) && isDef(vnode.parent)) {
                vnode.parent.data.pendingInsert = queue;
            } else {
                for (var i = 0; i < queue.length; ++i) {
                    queue[i].data.hook.insert(queue[i]);
                }
            }
        }

        var bailed = false;
        // list of modules that can skip create hook during hydration because they
        // are already rendered on the client or has no need for initialization
        var isRenderedModule = makeMap('attrs,style,class,staticClass,staticStyle,key');

        // Note: this is a browser-only function so we can assume elms are DOM nodes.
        function hydrate(elm, vnode, insertedVnodeQueue) {
            if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
                vnode.elm = elm;
                vnode.isAsyncPlaceholder = true;
                return true
            }
            {
                if (!assertNodeMatch(elm, vnode)) {
                    return false
                }
            }
            vnode.elm = elm;
            var tag = vnode.tag;
            var data = vnode.data;
            var children = vnode.children;
            if (isDef(data)) {
                if (isDef(i = data.hook) && isDef(i = i.init)) {
                    i(vnode, true /* hydrating */);
                }
                if (isDef(i = vnode.componentInstance)) {
                    // child component. it should have hydrated its own tree.
                    initComponent(vnode, insertedVnodeQueue);
                    return true
                }
            }
            if (isDef(tag)) {
                if (isDef(children)) {
                    // empty element, allow client to pick up and populate children
                    if (!elm.hasChildNodes()) {
                        createChildren(vnode, children, insertedVnodeQueue);
                    } else {
                        var childrenMatch = true;
                        var childNode = elm.firstChild;
                        for (var i$1 = 0; i$1 < children.length; i$1++) {
                            if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue)) {
                                childrenMatch = false;
                                break
                            }
                            childNode = childNode.nextSibling;
                        }
                        // if childNode is not null, it means the actual childNodes list is
                        // longer than the virtual children list.
                        if (!childrenMatch || childNode) {
                            if ("development" !== 'production' &&
                                typeof console !== 'undefined' &&
                                !bailed
                            ) {
                                bailed = true;
                                console.warn('Parent: ', elm);
                                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                            }
                            return false
                        }
                    }
                }
                if (isDef(data)) {
                    for (var key in data) {
                        if (!isRenderedModule(key)) {
                            invokeCreateHooks(vnode, insertedVnodeQueue);
                            break
                        }
                    }
                }
            } else if (elm.data !== vnode.text) {
                elm.data = vnode.text;
            }
            return true
        }

        function assertNodeMatch(node, vnode) {
            if (isDef(vnode.tag)) {
                return (
                    vnode.tag.indexOf('vue-component') === 0 ||
                    vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
                )
            } else {
                return node.nodeType === (vnode.isComment ? 8 : 3)
            }
        }

        return function patch(oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
            if (isUndef(vnode)) {
                if (isDef(oldVnode)) {
                    invokeDestroyHook(oldVnode);
                }
                return
            }

            var isInitialPatch = false;
            var insertedVnodeQueue = [];

            if (isUndef(oldVnode)) {
                // empty mount (likely as component), create new root element
                isInitialPatch = true;
                createElm(vnode, insertedVnodeQueue, parentElm, refElm);
            } else {
                var isRealElement = isDef(oldVnode.nodeType);
                if (!isRealElement && sameVnode(oldVnode, vnode)) {
                    // patch existing root node
                    patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
                } else {
                    if (isRealElement) {
                        // mounting to a real element
                        // check if this is server-rendered content and if we can perform
                        // a successful hydration.
                        if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                            oldVnode.removeAttribute(SSR_ATTR);
                            hydrating = true;
                        }
                        if (isTrue(hydrating)) {
                            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                                invokeInsertHook(vnode, insertedVnodeQueue, true);
                                return oldVnode
                            } else {
                                warn(
                                    'The client-side rendered virtual DOM tree is not matching ' +
                                    'server-rendered content. This is likely caused by incorrect ' +
                                    'HTML markup, for example nesting block-level elements inside ' +
                                    '<p>, or missing <tbody>. Bailing hydration and performing ' +
                                    'full client-side render.'
                                );
                            }
                        }
                        // either not server-rendered, or hydration failed.
                        // create an empty node and replace it
                        oldVnode = emptyNodeAt(oldVnode);
                    }
                    // replacing existing element
                    var oldElm = oldVnode.elm;
                    var parentElm$1 = nodeOps.parentNode(oldElm);
                    createElm(
                        vnode,
                        insertedVnodeQueue,
                        // extremely rare edge case: do not insert if old element is in a
                        // leaving transition. Only happens when combining transition +
                        // keep-alive + HOCs. (#4590)
                        oldElm._leaveCb ? null : parentElm$1,
                        nodeOps.nextSibling(oldElm)
                    );

                    if (isDef(vnode.parent)) {
                        // component root element replaced.
                        // update parent placeholder node element, recursively
                        var ancestor = vnode.parent;
                        while (ancestor) {
                            ancestor.elm = vnode.elm;
                            ancestor = ancestor.parent;
                        }
                        if (isPatchable(vnode)) {
                            for (var i = 0; i < cbs.create.length; ++i) {
                                cbs.create[i](emptyNode, vnode.parent);
                            }
                        }
                    }

                    if (isDef(parentElm$1)) {
                        removeVnodes(parentElm$1, [oldVnode], 0, 0);
                    } else if (isDef(oldVnode.tag)) {
                        invokeDestroyHook(oldVnode);
                    }
                }
            }

            invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
            return vnode.elm
        }
    }

    /*  */

    var directives = {
        create: updateDirectives,
        update: updateDirectives,
        destroy: function unbindDirectives(vnode) {
            updateDirectives(vnode, emptyNode);
        }
    };

    function updateDirectives(oldVnode, vnode) {
        if (oldVnode.data.directives || vnode.data.directives) {
            _update(oldVnode, vnode);
        }
    }

    function _update(oldVnode, vnode) {
        var isCreate = oldVnode === emptyNode;
        var isDestroy = vnode === emptyNode;
        var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
        var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

        var dirsWithInsert = [];
        var dirsWithPostpatch = [];

        var key, oldDir, dir;
        for (key in newDirs) {
            oldDir = oldDirs[key];
            dir = newDirs[key];
            if (!oldDir) {
                // new directive, bind
                callHook$1(dir, 'bind', vnode, oldVnode);
                if (dir.def && dir.def.inserted) {
                    dirsWithInsert.push(dir);
                }
            } else {
                // existing directive, update
                dir.oldValue = oldDir.value;
                callHook$1(dir, 'update', vnode, oldVnode);
                if (dir.def && dir.def.componentUpdated) {
                    dirsWithPostpatch.push(dir);
                }
            }
        }

        if (dirsWithInsert.length) {
            var callInsert = function () {
                for (var i = 0; i < dirsWithInsert.length; i++) {
                    callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
                }
            };
            if (isCreate) {
                mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert);
            } else {
                callInsert();
            }
        }

        if (dirsWithPostpatch.length) {
            mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', function () {
                for (var i = 0; i < dirsWithPostpatch.length; i++) {
                    callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
                }
            });
        }

        if (!isCreate) {
            for (key in oldDirs) {
                if (!newDirs[key]) {
                    // no longer present, unbind
                    callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
                }
            }
        }
    }

    var emptyModifiers = Object.create(null);

    function normalizeDirectives$1(
        dirs,
        vm
    ) {
        var res = Object.create(null);
        if (!dirs) {
            return res
        }
        var i, dir;
        for (i = 0; i < dirs.length; i++) {
            dir = dirs[i];
            if (!dir.modifiers) {
                dir.modifiers = emptyModifiers;
            }
            res[getRawDirName(dir)] = dir;
            dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
        }
        return res
    }

    function getRawDirName(dir) {
        return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
    }

    function callHook$1(dir, hook, vnode, oldVnode, isDestroy) {
        var fn = dir.def && dir.def[hook];
        if (fn) {
            try {
                fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
            } catch (e) {
                handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
            }
        }
    }

    var baseModules = [
        ref,
        directives
    ];

    /*  */

    function updateAttrs(oldVnode, vnode) {
        var opts = vnode.componentOptions;
        if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
            return
        }
        if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
            return
        }
        var key, cur, old;
        var elm = vnode.elm;
        var oldAttrs = oldVnode.data.attrs || {};
        var attrs = vnode.data.attrs || {};
        // clone observed objects, as the user probably wants to mutate it
        if (isDef(attrs.__ob__)) {
            attrs = vnode.data.attrs = extend({}, attrs);
        }

        for (key in attrs) {
            cur = attrs[key];
            old = oldAttrs[key];
            if (old !== cur) {
                setAttr(elm, key, cur);
            }
        }
        // #4391: in IE9, setting type can reset value for input[type=radio]
        /* istanbul ignore if */
        if (isIE9 && attrs.value !== oldAttrs.value) {
            setAttr(elm, 'value', attrs.value);
        }
        for (key in oldAttrs) {
            if (isUndef(attrs[key])) {
                if (isXlink(key)) {
                    elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
                } else if (!isEnumeratedAttr(key)) {
                    elm.removeAttribute(key);
                }
            }
        }
    }

    function setAttr(el, key, value) {
        if (isBooleanAttr(key)) {
            // set attribute for blank value
            // e.g. <option disabled>Select one</option>
            if (isFalsyAttrValue(value)) {
                el.removeAttribute(key);
            } else {
                el.setAttribute(key, key);
            }
        } else if (isEnumeratedAttr(key)) {
            el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
        } else if (isXlink(key)) {
            if (isFalsyAttrValue(value)) {
                el.removeAttributeNS(xlinkNS, getXlinkProp(key));
            } else {
                el.setAttributeNS(xlinkNS, key, value);
            }
        } else {
            if (isFalsyAttrValue(value)) {
                el.removeAttribute(key);
            } else {
                el.setAttribute(key, value);
            }
        }
    }

    var attrs = {
        create: updateAttrs,
        update: updateAttrs
    };

    /*  */

    function updateClass(oldVnode, vnode) {
        var el = vnode.elm;
        var data = vnode.data;
        var oldData = oldVnode.data;
        if (
            isUndef(data.staticClass) &&
            isUndef(data.class) && (
                isUndef(oldData) || (
                    isUndef(oldData.staticClass) &&
                    isUndef(oldData.class)
                )
            )
        ) {
            return
        }

        var cls = genClassForVnode(vnode);

        // handle transition classes
        var transitionClass = el._transitionClasses;
        if (isDef(transitionClass)) {
            cls = concat(cls, stringifyClass(transitionClass));
        }

        // set the class
        if (cls !== el._prevClass) {
            el.setAttribute('class', cls);
            el._prevClass = cls;
        }
    }

    var klass = {
        create: updateClass,
        update: updateClass
    };

    /*  */

    var validDivisionCharRE = /[\w).+\-_$\]]/;

    function parseFilters(exp) {
        var inSingle = false;
        var inDouble = false;
        var inTemplateString = false;
        var inRegex = false;
        var curly = 0;
        var square = 0;
        var paren = 0;
        var lastFilterIndex = 0;
        var c, prev, i, expression, filters;

        for (i = 0; i < exp.length; i++) {
            prev = c;
            c = exp.charCodeAt(i);
            if (inSingle) {
                if (c === 0x27 && prev !== 0x5C) {
                    inSingle = false;
                }
            } else if (inDouble) {
                if (c === 0x22 && prev !== 0x5C) {
                    inDouble = false;
                }
            } else if (inTemplateString) {
                if (c === 0x60 && prev !== 0x5C) {
                    inTemplateString = false;
                }
            } else if (inRegex) {
                if (c === 0x2f && prev !== 0x5C) {
                    inRegex = false;
                }
            } else if (
                c === 0x7C && // pipe
                exp.charCodeAt(i + 1) !== 0x7C &&
                exp.charCodeAt(i - 1) !== 0x7C &&
                !curly && !square && !paren
            ) {
                if (expression === undefined) {
                    // first filter, end of expression
                    lastFilterIndex = i + 1;
                    expression = exp.slice(0, i).trim();
                } else {
                    pushFilter();
                }
            } else {
                switch (c) {
                    case 0x22:
                        inDouble = true;
                        break         // "
                    case 0x27:
                        inSingle = true;
                        break         // '
                    case 0x60:
                        inTemplateString = true;
                        break // `
                    case 0x28:
                        paren++;
                        break                 // (
                    case 0x29:
                        paren--;
                        break                 // )
                    case 0x5B:
                        square++;
                        break                // [
                    case 0x5D:
                        square--;
                        break                // ]
                    case 0x7B:
                        curly++;
                        break                 // {
                    case 0x7D:
                        curly--;
                        break                 // }
                }
                if (c === 0x2f) { // /
                    var j = i - 1;
                    var p = (void 0);
                    // find first non-whitespace prev char
                    for (; j >= 0; j--) {
                        p = exp.charAt(j);
                        if (p !== ' ') {
                            break
                        }
                    }
                    if (!p || !validDivisionCharRE.test(p)) {
                        inRegex = true;
                    }
                }
            }
        }

        if (expression === undefined) {
            expression = exp.slice(0, i).trim();
        } else if (lastFilterIndex !== 0) {
            pushFilter();
        }

        function pushFilter() {
            (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
            lastFilterIndex = i + 1;
        }

        if (filters) {
            for (i = 0; i < filters.length; i++) {
                expression = wrapFilter(expression, filters[i]);
            }
        }

        return expression
    }

    function wrapFilter(exp, filter) {
        var i = filter.indexOf('(');
        if (i < 0) {
            // _f: resolveFilter
            return ("_f(\"" + filter + "\")(" + exp + ")")
        } else {
            var name = filter.slice(0, i);
            var args = filter.slice(i + 1);
            return ("_f(\"" + name + "\")(" + exp + "," + args)
        }
    }

    /*  */

    function baseWarn(msg) {
        console.error(("[Vue compiler]: " + msg));
    }

    function pluckModuleFunction(
        modules,
        key
    ) {
        return modules
            ? modules.map(function (m) {
                return m[key];
            }).filter(function (_) {
                return _;
            })
            : []
    }

    function addProp(el, name, value) {
        (el.props || (el.props = [])).push({name: name, value: value});
    }

    function addAttr(el, name, value) {
        (el.attrs || (el.attrs = [])).push({name: name, value: value});
    }

    function addDirective(
        el,
        name,
        rawName,
        value,
        arg,
        modifiers
    ) {
        (el.directives || (el.directives = [])).push({
            name: name,
            rawName: rawName,
            value: value,
            arg: arg,
            modifiers: modifiers
        });
    }

    function addHandler(
        el,
        name,
        value,
        modifiers,
        important,
        warn
    ) {
        // warn prevent and passive modifier
        /* istanbul ignore if */
        if (
            "development" !== 'production' && warn &&
            modifiers && modifiers.prevent && modifiers.passive
        ) {
            warn(
                'passive and prevent can\'t be used together. ' +
                'Passive handler can\'t prevent default event.'
            );
        }
        // check capture modifier
        if (modifiers && modifiers.capture) {
            delete modifiers.capture;
            name = '!' + name; // mark the event as captured
        }
        if (modifiers && modifiers.once) {
            delete modifiers.once;
            name = '~' + name; // mark the event as once
        }
        /* istanbul ignore if */
        if (modifiers && modifiers.passive) {
            delete modifiers.passive;
            name = '&' + name; // mark the event as passive
        }
        var events;
        if (modifiers && modifiers.native) {
            delete modifiers.native;
            events = el.nativeEvents || (el.nativeEvents = {});
        } else {
            events = el.events || (el.events = {});
        }
        var newHandler = {value: value, modifiers: modifiers};
        var handlers = events[name];
        /* istanbul ignore if */
        if (Array.isArray(handlers)) {
            important ? handlers.unshift(newHandler) : handlers.push(newHandler);
        } else if (handlers) {
            events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
        } else {
            events[name] = newHandler;
        }
    }

    function getBindingAttr(
        el,
        name,
        getStatic
    ) {
        var dynamicValue =
            getAndRemoveAttr(el, ':' + name) ||
            getAndRemoveAttr(el, 'v-bind:' + name);
        if (dynamicValue != null) {
            return parseFilters(dynamicValue)
        } else if (getStatic !== false) {
            var staticValue = getAndRemoveAttr(el, name);
            if (staticValue != null) {
                return JSON.stringify(staticValue)
            }
        }
    }

    function getAndRemoveAttr(el, name) {
        var val;
        if ((val = el.attrsMap[name]) != null) {
            var list = el.attrsList;
            for (var i = 0, l = list.length; i < l; i++) {
                if (list[i].name === name) {
                    list.splice(i, 1);
                    break
                }
            }
        }
        return val
    }

    /*  */

    /**
     * Cross-platform code generation for component v-model
     */
    function genComponentModel(
        el,
        value,
        modifiers
    ) {
        var ref = modifiers || {};
        var number = ref.number;
        var trim = ref.trim;

        var baseValueExpression = '$$v';
        var valueExpression = baseValueExpression;
        if (trim) {
            valueExpression =
                "(typeof " + baseValueExpression + " === 'string'" +
                "? " + baseValueExpression + ".trim()" +
                ": " + baseValueExpression + ")";
        }
        if (number) {
            valueExpression = "_n(" + valueExpression + ")";
        }
        var assignment = genAssignmentCode(value, valueExpression);

        el.model = {
            value: ("(" + value + ")"),
            expression: ("\"" + value + "\""),
            callback: ("function (" + baseValueExpression + ") {" + assignment + "}")
        };
    }

    /**
     * Cross-platform codegen helper for generating v-model value assignment code.
     */
    function genAssignmentCode(
        value,
        assignment
    ) {
        var modelRs = parseModel(value);
        if (modelRs.idx === null) {
            return (value + "=" + assignment)
        } else {
            return ("$set(" + (modelRs.exp) + ", " + (modelRs.idx) + ", " + assignment + ")")
        }
    }

    /**
     * parse directive model to do the array update transform. a[idx] = val => $$a.splice($$idx, 1, val)
     *
     * for loop possible cases:
     *
     * - test
     * - test[idx]
     * - test[test1[idx]]
     * - test["a"][idx]
     * - xxx.test[a[a].test1[idx]]
     * - test.xxx.a["asa"][test1[idx]]
     *
     */

    var len;
    var str;
    var chr;
    var index$1;
    var expressionPos;
    var expressionEndPos;

    function parseModel(val) {
        str = val;
        len = str.length;
        index$1 = expressionPos = expressionEndPos = 0;

        if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
            return {
                exp: val,
                idx: null
            }
        }

        while (!eof()) {
            chr = next();
            /* istanbul ignore if */
            if (isStringStart(chr)) {
                parseString(chr);
            } else if (chr === 0x5B) {
                parseBracket(chr);
            }
        }

        return {
            exp: val.substring(0, expressionPos),
            idx: val.substring(expressionPos + 1, expressionEndPos)
        }
    }

    function next() {
        return str.charCodeAt(++index$1)
    }

    function eof() {
        return index$1 >= len
    }

    function isStringStart(chr) {
        return chr === 0x22 || chr === 0x27
    }

    function parseBracket(chr) {
        var inBracket = 1;
        expressionPos = index$1;
        while (!eof()) {
            chr = next();
            if (isStringStart(chr)) {
                parseString(chr);
                continue
            }
            if (chr === 0x5B) {
                inBracket++;
            }
            if (chr === 0x5D) {
                inBracket--;
            }
            if (inBracket === 0) {
                expressionEndPos = index$1;
                break
            }
        }
    }

    function parseString(chr) {
        var stringQuote = chr;
        while (!eof()) {
            chr = next();
            if (chr === stringQuote) {
                break
            }
        }
    }

    /*  */

    var warn$1;

// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
    var RANGE_TOKEN = '__r';
    var CHECKBOX_RADIO_TOKEN = '__c';

    function model(
        el,
        dir,
        _warn
    ) {
        warn$1 = _warn;
        var value = dir.value;
        var modifiers = dir.modifiers;
        var tag = el.tag;
        var type = el.attrsMap.type;

        {
            var dynamicType = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
            if (tag === 'input' && dynamicType) {
                warn$1(
                    "<input :type=\"" + dynamicType + "\" v-model=\"" + value + "\">:\n" +
                    "v-model does not support dynamic input types. Use v-if branches instead."
                );
            }
            // inputs with type="file" are read only and setting the input's
            // value will throw an error.
            if (tag === 'input' && type === 'file') {
                warn$1(
                    "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
                    "File inputs are read only. Use a v-on:change listener instead."
                );
            }
        }

        if (el.component) {
            genComponentModel(el, value, modifiers);
            // component v-model doesn't need extra runtime
            return false
        } else if (tag === 'select') {
            genSelect(el, value, modifiers);
        } else if (tag === 'input' && type === 'checkbox') {
            genCheckboxModel(el, value, modifiers);
        } else if (tag === 'input' && type === 'radio') {
            genRadioModel(el, value, modifiers);
        } else if (tag === 'input' || tag === 'textarea') {
            genDefaultModel(el, value, modifiers);
        } else if (!config.isReservedTag(tag)) {
            genComponentModel(el, value, modifiers);
            // component v-model doesn't need extra runtime
            return false
        } else {
            warn$1(
                "<" + (el.tag) + " v-model=\"" + value + "\">: " +
                "v-model is not supported on this element type. " +
                'If you are working with contenteditable, it\'s recommended to ' +
                'wrap a library dedicated for that purpose inside a custom component.'
            );
        }

        // ensure runtime directive metadata
        return true
    }

    function genCheckboxModel(
        el,
        value,
        modifiers
    ) {
        var number = modifiers && modifiers.number;
        var valueBinding = getBindingAttr(el, 'value') || 'null';
        var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
        var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
        addProp(el, 'checked',
            "Array.isArray(" + value + ")" +
            "?_i(" + value + "," + valueBinding + ")>-1" + (
                trueValueBinding === 'true'
                    ? (":(" + value + ")")
                    : (":_q(" + value + "," + trueValueBinding + ")")
            )
        );
        addHandler(el, CHECKBOX_RADIO_TOKEN,
            "var $$a=" + value + "," +
            '$$el=$event.target,' +
            "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
            'if(Array.isArray($$a)){' +
            "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
            '$$i=_i($$a,$$v);' +
            "if($$c){$$i<0&&(" + value + "=$$a.concat($$v))}" +
            "else{$$i>-1&&(" + value + "=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}" +
            "}else{" + (genAssignmentCode(value, '$$c')) + "}",
            null, true
        );
    }

    function genRadioModel(
        el,
        value,
        modifiers
    ) {
        var number = modifiers && modifiers.number;
        var valueBinding = getBindingAttr(el, 'value') || 'null';
        valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
        addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
        addHandler(el, CHECKBOX_RADIO_TOKEN, genAssignmentCode(value, valueBinding), null, true);
    }

    function genSelect(
        el,
        value,
        modifiers
    ) {
        var number = modifiers && modifiers.number;
        var selectedVal = "Array.prototype.filter" +
            ".call($event.target.options,function(o){return o.selected})" +
            ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
            "return " + (number ? '_n(val)' : 'val') + "})";

        var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
        var code = "var $$selectedVal = " + selectedVal + ";";
        code = code + " " + (genAssignmentCode(value, assignment));
        addHandler(el, 'change', code, null, true);
    }

    function genDefaultModel(
        el,
        value,
        modifiers
    ) {
        var type = el.attrsMap.type;
        var ref = modifiers || {};
        var lazy = ref.lazy;
        var number = ref.number;
        var trim = ref.trim;
        var needCompositionGuard = !lazy && type !== 'range';
        var event = lazy
            ? 'change'
            : type === 'range'
                ? RANGE_TOKEN
                : 'input';

        var valueExpression = '$event.target.value';
        if (trim) {
            valueExpression = "$event.target.value.trim()";
        }
        if (number) {
            valueExpression = "_n(" + valueExpression + ")";
        }

        var code = genAssignmentCode(value, valueExpression);
        if (needCompositionGuard) {
            code = "if($event.target.composing)return;" + code;
        }

        addProp(el, 'value', ("(" + value + ")"));
        addHandler(el, event, code, null, true);
        if (trim || number) {
            addHandler(el, 'blur', '$forceUpdate()');
        }
    }

    /*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
    function normalizeEvents(on) {
        var event;
        /* istanbul ignore if */
        if (isDef(on[RANGE_TOKEN])) {
            // IE input[type=range] only supports `change` event
            event = isIE ? 'change' : 'input';
            on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
            delete on[RANGE_TOKEN];
        }
        if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
            // Chrome fires microtasks in between click/change, leads to #4521
            event = isChrome ? 'click' : 'change';
            on[event] = [].concat(on[CHECKBOX_RADIO_TOKEN], on[event] || []);
            delete on[CHECKBOX_RADIO_TOKEN];
        }
    }

    var target$1;

    function add$1(
        event,
        handler,
        once$$1,
        capture,
        passive
    ) {
        if (once$$1) {
            var oldHandler = handler;
            var _target = target$1; // save current target element in closure
            handler = function (ev) {
                var res = arguments.length === 1
                    ? oldHandler(ev)
                    : oldHandler.apply(null, arguments);
                if (res !== null) {
                    remove$2(event, handler, capture, _target);
                }
            };
        }
        target$1.addEventListener(
            event,
            handler,
            supportsPassive
                ? {capture: capture, passive: passive}
                : capture
        );
    }

    function remove$2(
        event,
        handler,
        capture,
        _target
    ) {
        (_target || target$1).removeEventListener(event, handler, capture);
    }

    function updateDOMListeners(oldVnode, vnode) {
        var isComponentRoot = isDef(vnode.componentOptions);
        var oldOn = isComponentRoot ? oldVnode.data.nativeOn : oldVnode.data.on;
        var on = isComponentRoot ? vnode.data.nativeOn : vnode.data.on;
        if (isUndef(oldOn) && isUndef(on)) {
            return
        }
        on = on || {};
        oldOn = oldOn || {};
        target$1 = vnode.elm;
        normalizeEvents(on);
        updateListeners(on, oldOn, add$1, remove$2, vnode.context);
    }

    var events = {
        create: updateDOMListeners,
        update: updateDOMListeners
    };

    /*  */

    function updateDOMProps(oldVnode, vnode) {
        if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
            return
        }
        var key, cur;
        var elm = vnode.elm;
        var oldProps = oldVnode.data.domProps || {};
        var props = vnode.data.domProps || {};
        // clone observed objects, as the user probably wants to mutate it
        if (isDef(props.__ob__)) {
            props = vnode.data.domProps = extend({}, props);
        }

        for (key in oldProps) {
            if (isUndef(props[key])) {
                elm[key] = '';
            }
        }
        for (key in props) {
            cur = props[key];
            // ignore children if the node has textContent or innerHTML,
            // as these will throw away existing DOM nodes and cause removal errors
            // on subsequent patches (#3360)
            if (key === 'textContent' || key === 'innerHTML') {
                if (vnode.children) {
                    vnode.children.length = 0;
                }
                if (cur === oldProps[key]) {
                    continue
                }
            }

            if (key === 'value') {
                // store value as _value as well since
                // non-string values will be stringified
                elm._value = cur;
                // avoid resetting cursor position when value is the same
                var strCur = isUndef(cur) ? '' : String(cur);
                if (shouldUpdateValue(elm, vnode, strCur)) {
                    elm.value = strCur;
                }
            } else {
                elm[key] = cur;
            }
        }
    }

// check platforms/web/util/attrs.js acceptValue


    function shouldUpdateValue(
        elm,
        vnode,
        checkVal
    ) {
        return (!elm.composing && (
            vnode.tag === 'option' ||
            isDirty(elm, checkVal) ||
            isInputChanged(elm, checkVal)
        ))
    }

    function isDirty(elm, checkVal) {
        // return true when textbox (.number and .trim) loses focus and its value is
        // not equal to the updated value
        return document.activeElement !== elm && elm.value !== checkVal
    }

    function isInputChanged(elm, newVal) {
        var value = elm.value;
        var modifiers = elm._vModifiers; // injected by v-model runtime
        if (isDef(modifiers) && modifiers.number) {
            return toNumber(value) !== toNumber(newVal)
        }
        if (isDef(modifiers) && modifiers.trim) {
            return value.trim() !== newVal.trim()
        }
        return value !== newVal
    }

    var domProps = {
        create: updateDOMProps,
        update: updateDOMProps
    };

    /*  */

    var parseStyleText = cached(function (cssText) {
        var res = {};
        var listDelimiter = /;(?![^(]*\))/g;
        var propertyDelimiter = /:(.+)/;
        cssText.split(listDelimiter).forEach(function (item) {
            if (item) {
                var tmp = item.split(propertyDelimiter);
                tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
            }
        });
        return res
    });

// merge static and dynamic style data on the same vnode
    function normalizeStyleData(data) {
        var style = normalizeStyleBinding(data.style);
        // static style is pre-processed into an object during compilation
        // and is always a fresh object, so it's safe to merge into it
        return data.staticStyle
            ? extend(data.staticStyle, style)
            : style
    }

// normalize possible array / string values into Object
    function normalizeStyleBinding(bindingStyle) {
        if (Array.isArray(bindingStyle)) {
            return toObject(bindingStyle)
        }
        if (typeof bindingStyle === 'string') {
            return parseStyleText(bindingStyle)
        }
        return bindingStyle
    }

    /**
     * parent component style should be after child's
     * so that parent component's style could override it
     */
    function getStyle(vnode, checkChild) {
        var res = {};
        var styleData;

        if (checkChild) {
            var childNode = vnode;
            while (childNode.componentInstance) {
                childNode = childNode.componentInstance._vnode;
                if (childNode.data && (styleData = normalizeStyleData(childNode.data))) {
                    extend(res, styleData);
                }
            }
        }

        if ((styleData = normalizeStyleData(vnode.data))) {
            extend(res, styleData);
        }

        var parentNode = vnode;
        while ((parentNode = parentNode.parent)) {
            if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
                extend(res, styleData);
            }
        }
        return res
    }

    /*  */

    var cssVarRE = /^--/;
    var importantRE = /\s*!important$/;
    var setProp = function (el, name, val) {
        /* istanbul ignore if */
        if (cssVarRE.test(name)) {
            el.style.setProperty(name, val);
        } else if (importantRE.test(val)) {
            el.style.setProperty(name, val.replace(importantRE, ''), 'important');
        } else {
            var normalizedName = normalize(name);
            if (Array.isArray(val)) {
                // Support values array created by autoprefixer, e.g.
                // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
                // Set them one by one, and the browser will only set those it can recognize
                for (var i = 0, len = val.length; i < len; i++) {
                    el.style[normalizedName] = val[i];
                }
            } else {
                el.style[normalizedName] = val;
            }
        }
    };

    var vendorNames = ['Webkit', 'Moz', 'ms'];

    var emptyStyle;
    var normalize = cached(function (prop) {
        emptyStyle = emptyStyle || document.createElement('div').style;
        prop = camelize(prop);
        if (prop !== 'filter' && (prop in emptyStyle)) {
            return prop
        }
        var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
        for (var i = 0; i < vendorNames.length; i++) {
            var name = vendorNames[i] + capName;
            if (name in emptyStyle) {
                return name
            }
        }
    });

    function updateStyle(oldVnode, vnode) {
        var data = vnode.data;
        var oldData = oldVnode.data;

        if (isUndef(data.staticStyle) && isUndef(data.style) &&
            isUndef(oldData.staticStyle) && isUndef(oldData.style)
        ) {
            return
        }

        var cur, name;
        var el = vnode.elm;
        var oldStaticStyle = oldData.staticStyle;
        var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

        // if static style exists, stylebinding already merged into it when doing normalizeStyleData
        var oldStyle = oldStaticStyle || oldStyleBinding;

        var style = normalizeStyleBinding(vnode.data.style) || {};

        // store normalized style under a different key for next diff
        // make sure to clone it if it's reactive, since the user likley wants
        // to mutate it.
        vnode.data.normalizedStyle = isDef(style.__ob__)
            ? extend({}, style)
            : style;

        var newStyle = getStyle(vnode, true);

        for (name in oldStyle) {
            if (isUndef(newStyle[name])) {
                setProp(el, name, '');
            }
        }
        for (name in newStyle) {
            cur = newStyle[name];
            if (cur !== oldStyle[name]) {
                // ie9 setting to null has no effect, must use empty string
                setProp(el, name, cur == null ? '' : cur);
            }
        }
    }

    var style = {
        create: updateStyle,
        update: updateStyle
    };

    /*  */

    /**
     * Add class with compatibility for SVG since classList is not supported on
     * SVG elements in IE
     */
    function addClass(el, cls) {
        /* istanbul ignore if */
        if (!cls || !(cls = cls.trim())) {
            return
        }

        /* istanbul ignore else */
        if (el.classList) {
            if (cls.indexOf(' ') > -1) {
                cls.split(/\s+/).forEach(function (c) {
                    return el.classList.add(c);
                });
            } else {
                el.classList.add(cls);
            }
        } else {
            var cur = " " + (el.getAttribute('class') || '') + " ";
            if (cur.indexOf(' ' + cls + ' ') < 0) {
                el.setAttribute('class', (cur + cls).trim());
            }
        }
    }

    /**
     * Remove class with compatibility for SVG since classList is not supported on
     * SVG elements in IE
     */
    function removeClass(el, cls) {
        /* istanbul ignore if */
        if (!cls || !(cls = cls.trim())) {
            return
        }

        /* istanbul ignore else */
        if (el.classList) {
            if (cls.indexOf(' ') > -1) {
                cls.split(/\s+/).forEach(function (c) {
                    return el.classList.remove(c);
                });
            } else {
                el.classList.remove(cls);
            }
            if (!el.classList.length) {
                el.removeAttribute('class');
            }
        } else {
            var cur = " " + (el.getAttribute('class') || '') + " ";
            var tar = ' ' + cls + ' ';
            while (cur.indexOf(tar) >= 0) {
                cur = cur.replace(tar, ' ');
            }
            cur = cur.trim();
            if (cur) {
                el.setAttribute('class', cur);
            } else {
                el.removeAttribute('class');
            }
        }
    }

    /*  */

    function resolveTransition(def$$1) {
        if (!def$$1) {
            return
        }
        /* istanbul ignore else */
        if (typeof def$$1 === 'object') {
            var res = {};
            if (def$$1.css !== false) {
                extend(res, autoCssTransition(def$$1.name || 'v'));
            }
            extend(res, def$$1);
            return res
        } else if (typeof def$$1 === 'string') {
            return autoCssTransition(def$$1)
        }
    }

    var autoCssTransition = cached(function (name) {
        return {
            enterClass: (name + "-enter"),
            enterToClass: (name + "-enter-to"),
            enterActiveClass: (name + "-enter-active"),
            leaveClass: (name + "-leave"),
            leaveToClass: (name + "-leave-to"),
            leaveActiveClass: (name + "-leave-active")
        }
    });

    var hasTransition = inBrowser && !isIE9;
    var TRANSITION = 'transition';
    var ANIMATION = 'animation';

// Transition property/event sniffing
    var transitionProp = 'transition';
    var transitionEndEvent = 'transitionend';
    var animationProp = 'animation';
    var animationEndEvent = 'animationend';
    if (hasTransition) {
        /* istanbul ignore if */
        if (window.ontransitionend === undefined &&
            window.onwebkittransitionend !== undefined
        ) {
            transitionProp = 'WebkitTransition';
            transitionEndEvent = 'webkitTransitionEnd';
        }
        if (window.onanimationend === undefined &&
            window.onwebkitanimationend !== undefined
        ) {
            animationProp = 'WebkitAnimation';
            animationEndEvent = 'webkitAnimationEnd';
        }
    }

// binding to window is necessary to make hot reload work in IE in strict mode
    var raf = inBrowser && window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : setTimeout;

    function nextFrame(fn) {
        raf(function () {
            raf(fn);
        });
    }

    function addTransitionClass(el, cls) {
        var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
        if (transitionClasses.indexOf(cls) < 0) {
            transitionClasses.push(cls);
            addClass(el, cls);
        }
    }

    function removeTransitionClass(el, cls) {
        if (el._transitionClasses) {
            remove(el._transitionClasses, cls);
        }
        removeClass(el, cls);
    }

    function whenTransitionEnds(
        el,
        expectedType,
        cb
    ) {
        var ref = getTransitionInfo(el, expectedType);
        var type = ref.type;
        var timeout = ref.timeout;
        var propCount = ref.propCount;
        if (!type) {
            return cb()
        }
        var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
        var ended = 0;
        var end = function () {
            el.removeEventListener(event, onEnd);
            cb();
        };
        var onEnd = function (e) {
            if (e.target === el) {
                if (++ended >= propCount) {
                    end();
                }
            }
        };
        setTimeout(function () {
            if (ended < propCount) {
                end();
            }
        }, timeout + 1);
        el.addEventListener(event, onEnd);
    }

    var transformRE = /\b(transform|all)(,|$)/;

    function getTransitionInfo(el, expectedType) {
        var styles = window.getComputedStyle(el);
        var transitionDelays = styles[transitionProp + 'Delay'].split(', ');
        var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
        var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
        var animationDelays = styles[animationProp + 'Delay'].split(', ');
        var animationDurations = styles[animationProp + 'Duration'].split(', ');
        var animationTimeout = getTimeout(animationDelays, animationDurations);

        var type;
        var timeout = 0;
        var propCount = 0;
        /* istanbul ignore if */
        if (expectedType === TRANSITION) {
            if (transitionTimeout > 0) {
                type = TRANSITION;
                timeout = transitionTimeout;
                propCount = transitionDurations.length;
            }
        } else if (expectedType === ANIMATION) {
            if (animationTimeout > 0) {
                type = ANIMATION;
                timeout = animationTimeout;
                propCount = animationDurations.length;
            }
        } else {
            timeout = Math.max(transitionTimeout, animationTimeout);
            type = timeout > 0
                ? transitionTimeout > animationTimeout
                    ? TRANSITION
                    : ANIMATION
                : null;
            propCount = type
                ? type === TRANSITION
                    ? transitionDurations.length
                    : animationDurations.length
                : 0;
        }
        var hasTransform =
            type === TRANSITION &&
            transformRE.test(styles[transitionProp + 'Property']);
        return {
            type: type,
            timeout: timeout,
            propCount: propCount,
            hasTransform: hasTransform
        }
    }

    function getTimeout(delays, durations) {
        /* istanbul ignore next */
        while (delays.length < durations.length) {
            delays = delays.concat(delays);
        }

        return Math.max.apply(null, durations.map(function (d, i) {
            return toMs(d) + toMs(delays[i])
        }))
    }

    function toMs(s) {
        return Number(s.slice(0, -1)) * 1000
    }

    /*  */

    function enter(vnode, toggleDisplay) {
        var el = vnode.elm;

        // call leave callback now
        if (isDef(el._leaveCb)) {
            el._leaveCb.cancelled = true;
            el._leaveCb();
        }

        var data = resolveTransition(vnode.data.transition);
        if (isUndef(data)) {
            return
        }

        /* istanbul ignore if */
        if (isDef(el._enterCb) || el.nodeType !== 1) {
            return
        }

        var css = data.css;
        var type = data.type;
        var enterClass = data.enterClass;
        var enterToClass = data.enterToClass;
        var enterActiveClass = data.enterActiveClass;
        var appearClass = data.appearClass;
        var appearToClass = data.appearToClass;
        var appearActiveClass = data.appearActiveClass;
        var beforeEnter = data.beforeEnter;
        var enter = data.enter;
        var afterEnter = data.afterEnter;
        var enterCancelled = data.enterCancelled;
        var beforeAppear = data.beforeAppear;
        var appear = data.appear;
        var afterAppear = data.afterAppear;
        var appearCancelled = data.appearCancelled;
        var duration = data.duration;

        // activeInstance will always be the <transition> component managing this
        // transition. One edge case to check is when the <transition> is placed
        // as the root node of a child component. In that case we need to check
        // <transition>'s parent for appear check.
        var context = activeInstance;
        var transitionNode = activeInstance.$vnode;
        while (transitionNode && transitionNode.parent) {
            transitionNode = transitionNode.parent;
            context = transitionNode.context;
        }

        var isAppear = !context._isMounted || !vnode.isRootInsert;

        if (isAppear && !appear && appear !== '') {
            return
        }

        var startClass = isAppear && appearClass
            ? appearClass
            : enterClass;
        var activeClass = isAppear && appearActiveClass
            ? appearActiveClass
            : enterActiveClass;
        var toClass = isAppear && appearToClass
            ? appearToClass
            : enterToClass;

        var beforeEnterHook = isAppear
            ? (beforeAppear || beforeEnter)
            : beforeEnter;
        var enterHook = isAppear
            ? (typeof appear === 'function' ? appear : enter)
            : enter;
        var afterEnterHook = isAppear
            ? (afterAppear || afterEnter)
            : afterEnter;
        var enterCancelledHook = isAppear
            ? (appearCancelled || enterCancelled)
            : enterCancelled;

        var explicitEnterDuration = toNumber(
            isObject(duration)
                ? duration.enter
                : duration
        );

        if ("development" !== 'production' && explicitEnterDuration != null) {
            checkDuration(explicitEnterDuration, 'enter', vnode);
        }

        var expectsCSS = css !== false && !isIE9;
        var userWantsControl = getHookArgumentsLength(enterHook);

        var cb = el._enterCb = once(function () {
            if (expectsCSS) {
                removeTransitionClass(el, toClass);
                removeTransitionClass(el, activeClass);
            }
            if (cb.cancelled) {
                if (expectsCSS) {
                    removeTransitionClass(el, startClass);
                }
                enterCancelledHook && enterCancelledHook(el);
            } else {
                afterEnterHook && afterEnterHook(el);
            }
            el._enterCb = null;
        });

        if (!vnode.data.show) {
            // remove pending leave element on enter by injecting an insert hook
            mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
                var parent = el.parentNode;
                var pendingNode = parent && parent._pending && parent._pending[vnode.key];
                if (pendingNode &&
                    pendingNode.tag === vnode.tag &&
                    pendingNode.elm._leaveCb
                ) {
                    pendingNode.elm._leaveCb();
                }
                enterHook && enterHook(el, cb);
            });
        }

        // start enter transition
        beforeEnterHook && beforeEnterHook(el);
        if (expectsCSS) {
            addTransitionClass(el, startClass);
            addTransitionClass(el, activeClass);
            nextFrame(function () {
                addTransitionClass(el, toClass);
                removeTransitionClass(el, startClass);
                if (!cb.cancelled && !userWantsControl) {
                    if (isValidDuration(explicitEnterDuration)) {
                        setTimeout(cb, explicitEnterDuration);
                    } else {
                        whenTransitionEnds(el, type, cb);
                    }
                }
            });
        }

        if (vnode.data.show) {
            toggleDisplay && toggleDisplay();
            enterHook && enterHook(el, cb);
        }

        if (!expectsCSS && !userWantsControl) {
            cb();
        }
    }

    function leave(vnode, rm) {
        var el = vnode.elm;

        // call enter callback now
        if (isDef(el._enterCb)) {
            el._enterCb.cancelled = true;
            el._enterCb();
        }

        var data = resolveTransition(vnode.data.transition);
        if (isUndef(data)) {
            return rm()
        }

        /* istanbul ignore if */
        if (isDef(el._leaveCb) || el.nodeType !== 1) {
            return
        }

        var css = data.css;
        var type = data.type;
        var leaveClass = data.leaveClass;
        var leaveToClass = data.leaveToClass;
        var leaveActiveClass = data.leaveActiveClass;
        var beforeLeave = data.beforeLeave;
        var leave = data.leave;
        var afterLeave = data.afterLeave;
        var leaveCancelled = data.leaveCancelled;
        var delayLeave = data.delayLeave;
        var duration = data.duration;

        var expectsCSS = css !== false && !isIE9;
        var userWantsControl = getHookArgumentsLength(leave);

        var explicitLeaveDuration = toNumber(
            isObject(duration)
                ? duration.leave
                : duration
        );

        if ("development" !== 'production' && isDef(explicitLeaveDuration)) {
            checkDuration(explicitLeaveDuration, 'leave', vnode);
        }

        var cb = el._leaveCb = once(function () {
            if (el.parentNode && el.parentNode._pending) {
                el.parentNode._pending[vnode.key] = null;
            }
            if (expectsCSS) {
                removeTransitionClass(el, leaveToClass);
                removeTransitionClass(el, leaveActiveClass);
            }
            if (cb.cancelled) {
                if (expectsCSS) {
                    removeTransitionClass(el, leaveClass);
                }
                leaveCancelled && leaveCancelled(el);
            } else {
                rm();
                afterLeave && afterLeave(el);
            }
            el._leaveCb = null;
        });

        if (delayLeave) {
            delayLeave(performLeave);
        } else {
            performLeave();
        }

        function performLeave() {
            // the delayed leave may have already been cancelled
            if (cb.cancelled) {
                return
            }
            // record leaving element
            if (!vnode.data.show) {
                (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
            }
            beforeLeave && beforeLeave(el);
            if (expectsCSS) {
                addTransitionClass(el, leaveClass);
                addTransitionClass(el, leaveActiveClass);
                nextFrame(function () {
                    addTransitionClass(el, leaveToClass);
                    removeTransitionClass(el, leaveClass);
                    if (!cb.cancelled && !userWantsControl) {
                        if (isValidDuration(explicitLeaveDuration)) {
                            setTimeout(cb, explicitLeaveDuration);
                        } else {
                            whenTransitionEnds(el, type, cb);
                        }
                    }
                });
            }
            leave && leave(el, cb);
            if (!expectsCSS && !userWantsControl) {
                cb();
            }
        }
    }

// only used in dev mode
    function checkDuration(val, name, vnode) {
        if (typeof val !== 'number') {
            warn(
                "<transition> explicit " + name + " duration is not a valid number - " +
                "got " + (JSON.stringify(val)) + ".",
                vnode.context
            );
        } else if (isNaN(val)) {
            warn(
                "<transition> explicit " + name + " duration is NaN - " +
                'the duration expression might be incorrect.',
                vnode.context
            );
        }
    }

    function isValidDuration(val) {
        return typeof val === 'number' && !isNaN(val)
    }

    /**
     * Normalize a transition hook's argument length. The hook may be:
     * - a merged hook (invoker) with the original in .fns
     * - a wrapped component method (check ._length)
     * - a plain function (.length)
     */
    function getHookArgumentsLength(fn) {
        if (isUndef(fn)) {
            return false
        }
        var invokerFns = fn.fns;
        if (isDef(invokerFns)) {
            // invoker
            return getHookArgumentsLength(
                Array.isArray(invokerFns)
                    ? invokerFns[0]
                    : invokerFns
            )
        } else {
            return (fn._length || fn.length) > 1
        }
    }

    function _enter(_, vnode) {
        if (vnode.data.show !== true) {
            enter(vnode);
        }
    }

    var transition = inBrowser ? {
        create: _enter,
        activate: _enter,
        remove: function remove$$1(vnode, rm) {
            /* istanbul ignore else */
            if (vnode.data.show !== true) {
                leave(vnode, rm);
            } else {
                rm();
            }
        }
    } : {};

    var platformModules = [
        attrs,
        klass,
        events,
        domProps,
        style,
        transition
    ];

    /*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
    var modules = platformModules.concat(baseModules);

    var patch = createPatchFunction({nodeOps: nodeOps, modules: modules});

    /**
     * Not type checking this file because flow doesn't like attaching
     * properties to Elements.
     */

    var isTextInputType = makeMap('text,number,password,search,email,tel,url');

    /* istanbul ignore if */
    if (isIE9) {
        // http://www.matts411.com/post/internet-explorer-9-oninput/
        document.addEventListener('selectionchange', function () {
            var el = document.activeElement;
            if (el && el.vmodel) {
                trigger(el, 'input');
            }
        });
    }

    var model$1 = {
        inserted: function inserted(el, binding, vnode) {
            if (vnode.tag === 'select') {
                var cb = function () {
                    setSelected(el, binding, vnode.context);
                };
                cb();
                /* istanbul ignore if */
                if (isIE || isEdge) {
                    setTimeout(cb, 0);
                }
            } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
                el._vModifiers = binding.modifiers;
                if (!binding.modifiers.lazy) {
                    // Safari < 10.2 & UIWebView doesn't fire compositionend when
                    // switching focus before confirming composition choice
                    // this also fixes the issue where some browsers e.g. iOS Chrome
                    // fires "change" instead of "input" on autocomplete.
                    el.addEventListener('change', onCompositionEnd);
                    if (!isAndroid) {
                        el.addEventListener('compositionstart', onCompositionStart);
                        el.addEventListener('compositionend', onCompositionEnd);
                    }
                    /* istanbul ignore if */
                    if (isIE9) {
                        el.vmodel = true;
                    }
                }
            }
        },
        componentUpdated: function componentUpdated(el, binding, vnode) {
            if (vnode.tag === 'select') {
                setSelected(el, binding, vnode.context);
                // in case the options rendered by v-for have changed,
                // it's possible that the value is out-of-sync with the rendered options.
                // detect such cases and filter out values that no longer has a matching
                // option in the DOM.
                var needReset = el.multiple
                    ? binding.value.some(function (v) {
                        return hasNoMatchingOption(v, el.options);
                    })
                    : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, el.options);
                if (needReset) {
                    trigger(el, 'change');
                }
            }
        }
    };

    function setSelected(el, binding, vm) {
        var value = binding.value;
        var isMultiple = el.multiple;
        if (isMultiple && !Array.isArray(value)) {
            "development" !== 'production' && warn(
                "<select multiple v-model=\"" + (binding.expression) + "\"> " +
                "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
                vm
            );
            return
        }
        var selected, option;
        for (var i = 0, l = el.options.length; i < l; i++) {
            option = el.options[i];
            if (isMultiple) {
                selected = looseIndexOf(value, getValue(option)) > -1;
                if (option.selected !== selected) {
                    option.selected = selected;
                }
            } else {
                if (looseEqual(getValue(option), value)) {
                    if (el.selectedIndex !== i) {
                        el.selectedIndex = i;
                    }
                    return
                }
            }
        }
        if (!isMultiple) {
            el.selectedIndex = -1;
        }
    }

    function hasNoMatchingOption(value, options) {
        for (var i = 0, l = options.length; i < l; i++) {
            if (looseEqual(getValue(options[i]), value)) {
                return false
            }
        }
        return true
    }

    function getValue(option) {
        return '_value' in option
            ? option._value
            : option.value
    }

    function onCompositionStart(e) {
        e.target.composing = true;
    }

    function onCompositionEnd(e) {
        // prevent triggering an input event for no reason
        if (!e.target.composing) {
            return
        }
        e.target.composing = false;
        trigger(e.target, 'input');
    }

    function trigger(el, type) {
        var e = document.createEvent('HTMLEvents');
        e.initEvent(type, true, true);
        el.dispatchEvent(e);
    }

    /*  */

// recursively search for possible transition defined inside the component root
    function locateNode(vnode) {
        return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
            ? locateNode(vnode.componentInstance._vnode)
            : vnode
    }

    var show = {
        bind: function bind(el, ref, vnode) {
            var value = ref.value;

            vnode = locateNode(vnode);
            var transition$$1 = vnode.data && vnode.data.transition;
            var originalDisplay = el.__vOriginalDisplay =
                el.style.display === 'none' ? '' : el.style.display;
            if (value && transition$$1 && !isIE9) {
                vnode.data.show = true;
                enter(vnode, function () {
                    el.style.display = originalDisplay;
                });
            } else {
                el.style.display = value ? originalDisplay : 'none';
            }
        },

        update: function update(el, ref, vnode) {
            var value = ref.value;
            var oldValue = ref.oldValue;

            /* istanbul ignore if */
            if (value === oldValue) {
                return
            }
            vnode = locateNode(vnode);
            var transition$$1 = vnode.data && vnode.data.transition;
            if (transition$$1 && !isIE9) {
                vnode.data.show = true;
                if (value) {
                    enter(vnode, function () {
                        el.style.display = el.__vOriginalDisplay;
                    });
                } else {
                    leave(vnode, function () {
                        el.style.display = 'none';
                    });
                }
            } else {
                el.style.display = value ? el.__vOriginalDisplay : 'none';
            }
        },

        unbind: function unbind(
            el,
            binding,
            vnode,
            oldVnode,
            isDestroy
        ) {
            if (!isDestroy) {
                el.style.display = el.__vOriginalDisplay;
            }
        }
    };

    var platformDirectives = {
        model: model$1,
        show: show
    };

    /*  */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

    var transitionProps = {
        name: String,
        appear: Boolean,
        css: Boolean,
        mode: String,
        type: String,
        enterClass: String,
        leaveClass: String,
        enterToClass: String,
        leaveToClass: String,
        enterActiveClass: String,
        leaveActiveClass: String,
        appearClass: String,
        appearActiveClass: String,
        appearToClass: String,
        duration: [Number, String, Object]
    };

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
    function getRealChild(vnode) {
        var compOptions = vnode && vnode.componentOptions;
        if (compOptions && compOptions.Ctor.options.abstract) {
            return getRealChild(getFirstComponentChild(compOptions.children))
        } else {
            return vnode
        }
    }

    function extractTransitionData(comp) {
        var data = {};
        var options = comp.$options;
        // props
        for (var key in options.propsData) {
            data[key] = comp[key];
        }
        // events.
        // extract listeners and pass them directly to the transition methods
        var listeners = options._parentListeners;
        for (var key$1 in listeners) {
            data[camelize(key$1)] = listeners[key$1];
        }
        return data
    }

    function placeholder(h, rawChild) {
        if (/\d-keep-alive$/.test(rawChild.tag)) {
            return h('keep-alive', {
                props: rawChild.componentOptions.propsData
            })
        }
    }

    function hasParentTransition(vnode) {
        while ((vnode = vnode.parent)) {
            if (vnode.data.transition) {
                return true
            }
        }
    }

    function isSameChild(child, oldChild) {
        return oldChild.key === child.key && oldChild.tag === child.tag
    }

    function isAsyncPlaceholder(node) {
        return node.isComment && node.asyncFactory
    }

    var Transition = {
        name: 'transition',
        props: transitionProps,
        abstract: true,

        render: function render(h) {
            var this$1 = this;

            var children = this.$options._renderChildren;
            if (!children) {
                return
            }

            // filter out text nodes (possible whitespaces)
            children = children.filter(function (c) {
                return c.tag || isAsyncPlaceholder(c);
            });
            /* istanbul ignore if */
            if (!children.length) {
                return
            }

            // warn multiple elements
            if ("development" !== 'production' && children.length > 1) {
                warn(
                    '<transition> can only be used on a single element. Use ' +
                    '<transition-group> for lists.',
                    this.$parent
                );
            }

            var mode = this.mode;

            // warn invalid mode
            if ("development" !== 'production' &&
                mode && mode !== 'in-out' && mode !== 'out-in'
            ) {
                warn(
                    'invalid <transition> mode: ' + mode,
                    this.$parent
                );
            }

            var rawChild = children[0];

            // if this is a component root node and the component's
            // parent container node also has transition, skip.
            if (hasParentTransition(this.$vnode)) {
                return rawChild
            }

            // apply transition data to child
            // use getRealChild() to ignore abstract components e.g. keep-alive
            var child = getRealChild(rawChild);
            /* istanbul ignore if */
            if (!child) {
                return rawChild
            }

            if (this._leaving) {
                return placeholder(h, rawChild)
            }

            // ensure a key that is unique to the vnode type and to this transition
            // component instance. This key will be used to remove pending leaving nodes
            // during entering.
            var id = "__transition-" + (this._uid) + "-";
            child.key = child.key == null
                ? child.isComment
                    ? id + 'comment'
                    : id + child.tag
                : isPrimitive(child.key)
                    ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
                    : child.key;

            var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
            var oldRawChild = this._vnode;
            var oldChild = getRealChild(oldRawChild);

            // mark v-show
            // so that the transition module can hand over the control to the directive
            if (child.data.directives && child.data.directives.some(function (d) {
                return d.name === 'show';
            })) {
                child.data.show = true;
            }

            if (
                oldChild &&
                oldChild.data &&
                !isSameChild(child, oldChild) &&
                !isAsyncPlaceholder(oldChild)
            ) {
                // replace old child transition data with fresh one
                // important for dynamic transitions!
                var oldData = oldChild && (oldChild.data.transition = extend({}, data));
                // handle transition mode
                if (mode === 'out-in') {
                    // return placeholder node and queue update when leave finishes
                    this._leaving = true;
                    mergeVNodeHook(oldData, 'afterLeave', function () {
                        this$1._leaving = false;
                        this$1.$forceUpdate();
                    });
                    return placeholder(h, rawChild)
                } else if (mode === 'in-out') {
                    if (isAsyncPlaceholder(child)) {
                        return oldRawChild
                    }
                    var delayedLeave;
                    var performLeave = function () {
                        delayedLeave();
                    };
                    mergeVNodeHook(data, 'afterEnter', performLeave);
                    mergeVNodeHook(data, 'enterCancelled', performLeave);
                    mergeVNodeHook(oldData, 'delayLeave', function (leave) {
                        delayedLeave = leave;
                    });
                }
            }

            return rawChild
        }
    };

    /*  */

// Provides transition support for list items.
// supports move transitions using the FLIP technique.

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final desired state. This way in the second pass removed
// nodes will remain where they should be.

    var props = extend({
        tag: String,
        moveClass: String
    }, transitionProps);

    delete props.mode;

    var TransitionGroup = {
        props: props,

        render: function render(h) {
            var tag = this.tag || this.$vnode.data.tag || 'span';
            var map = Object.create(null);
            var prevChildren = this.prevChildren = this.children;
            var rawChildren = this.$slots.default || [];
            var children = this.children = [];
            var transitionData = extractTransitionData(this);

            for (var i = 0; i < rawChildren.length; i++) {
                var c = rawChildren[i];
                if (c.tag) {
                    if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
                        children.push(c);
                        map[c.key] = c
                        ;(c.data || (c.data = {})).transition = transitionData;
                    } else {
                        var opts = c.componentOptions;
                        var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
                        warn(("<transition-group> children must be keyed: <" + name + ">"));
                    }
                }
            }

            if (prevChildren) {
                var kept = [];
                var removed = [];
                for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
                    var c$1 = prevChildren[i$1];
                    c$1.data.transition = transitionData;
                    c$1.data.pos = c$1.elm.getBoundingClientRect();
                    if (map[c$1.key]) {
                        kept.push(c$1);
                    } else {
                        removed.push(c$1);
                    }
                }
                this.kept = h(tag, null, kept);
                this.removed = removed;
            }

            return h(tag, null, children)
        },

        beforeUpdate: function beforeUpdate() {
            // force removing pass
            this.__patch__(
                this._vnode,
                this.kept,
                false, // hydrating
                true // removeOnly (!important, avoids unnecessary moves)
            );
            this._vnode = this.kept;
        },

        updated: function updated() {
            var children = this.prevChildren;
            var moveClass = this.moveClass || ((this.name || 'v') + '-move');
            if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
                return
            }

            // we divide the work into three loops to avoid mixing DOM reads and writes
            // in each iteration - which helps prevent layout thrashing.
            children.forEach(callPendingCbs);
            children.forEach(recordPosition);
            children.forEach(applyTranslation);

            // force reflow to put everything in position
            var body = document.body;
            var f = body.offsetHeight; // eslint-disable-line

            children.forEach(function (c) {
                if (c.data.moved) {
                    var el = c.elm;
                    var s = el.style;
                    addTransitionClass(el, moveClass);
                    s.transform = s.WebkitTransform = s.transitionDuration = '';
                    el.addEventListener(transitionEndEvent, el._moveCb = function cb(e) {
                        if (!e || /transform$/.test(e.propertyName)) {
                            el.removeEventListener(transitionEndEvent, cb);
                            el._moveCb = null;
                            removeTransitionClass(el, moveClass);
                        }
                    });
                }
            });
        },

        methods: {
            hasMove: function hasMove(el, moveClass) {
                /* istanbul ignore if */
                if (!hasTransition) {
                    return false
                }
                /* istanbul ignore if */
                if (this._hasMove) {
                    return this._hasMove
                }
                // Detect whether an element with the move class applied has
                // CSS transitions. Since the element may be inside an entering
                // transition at this very moment, we make a clone of it and remove
                // all other transition classes applied to ensure only the move class
                // is applied.
                var clone = el.cloneNode();
                if (el._transitionClasses) {
                    el._transitionClasses.forEach(function (cls) {
                        removeClass(clone, cls);
                    });
                }
                addClass(clone, moveClass);
                clone.style.display = 'none';
                this.$el.appendChild(clone);
                var info = getTransitionInfo(clone);
                this.$el.removeChild(clone);
                return (this._hasMove = info.hasTransform)
            }
        }
    };

    function callPendingCbs(c) {
        /* istanbul ignore if */
        if (c.elm._moveCb) {
            c.elm._moveCb();
        }
        /* istanbul ignore if */
        if (c.elm._enterCb) {
            c.elm._enterCb();
        }
    }

    function recordPosition(c) {
        c.data.newPos = c.elm.getBoundingClientRect();
    }

    function applyTranslation(c) {
        var oldPos = c.data.pos;
        var newPos = c.data.newPos;
        var dx = oldPos.left - newPos.left;
        var dy = oldPos.top - newPos.top;
        if (dx || dy) {
            c.data.moved = true;
            var s = c.elm.style;
            s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
            s.transitionDuration = '0s';
        }
    }

    var platformComponents = {
        Transition: Transition,
        TransitionGroup: TransitionGroup
    };

    /*  */

// install platform specific utils
    Vue$3.config.mustUseProp = mustUseProp;
    Vue$3.config.isReservedTag = isReservedTag;
    Vue$3.config.isReservedAttr = isReservedAttr;
    Vue$3.config.getTagNamespace = getTagNamespace;
    Vue$3.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
    extend(Vue$3.options.directives, platformDirectives);
    extend(Vue$3.options.components, platformComponents);

// install platform patch function
    Vue$3.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
    Vue$3.prototype.$mount = function (
        el,
        hydrating
    ) {
        el = el && inBrowser ? query(el) : undefined;
        return mountComponent(this, el, hydrating)
    };

// devtools global hook
    /* istanbul ignore next */
    setTimeout(function () {
        if (config.devtools) {
            if (devtools) {
                devtools.emit('init', Vue$3);
            } else if ("development" !== 'production' && isChrome) {
                console[console.info ? 'info' : 'log'](
                    'Download the Vue Devtools extension for a better development experience:\n' +
                    'https://github.com/vuejs/vue-devtools'
                );
            }
        }
        if ("development" !== 'production' &&
            config.productionTip !== false &&
            inBrowser && typeof console !== 'undefined'
        ) {
            console[console.info ? 'info' : 'log'](
                "You are running Vue in development mode.\n" +
                "Make sure to turn on production mode when deploying for production.\n" +
                "See more tips at https://vuejs.org/guide/deployment.html"
            );
        }
    }, 0);

    /*  */

// check whether current browser encodes a char inside attribute values
    function shouldDecode(content, encoded) {
        var div = document.createElement('div');
        div.innerHTML = "<div a=\"" + content + "\"/>";
        return div.innerHTML.indexOf(encoded) > 0
    }

// #3663
// IE encodes newlines inside attribute values while other browsers don't
    var shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false;

    /*  */

    var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
    var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

    var buildRegex = cached(function (delimiters) {
        var open = delimiters[0].replace(regexEscapeRE, '\\$&');
        var close = delimiters[1].replace(regexEscapeRE, '\\$&');
        return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
    });

    function parseText(
        text,
        delimiters
    ) {
        var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
        if (!tagRE.test(text)) {
            return
        }
        var tokens = [];
        var lastIndex = tagRE.lastIndex = 0;
        var match, index;
        while ((match = tagRE.exec(text))) {
            index = match.index;
            // push text token
            if (index > lastIndex) {
                tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            // tag token
            var exp = parseFilters(match[1].trim());
            tokens.push(("_s(" + exp + ")"));
            lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return tokens.join('+')
    }

    /*  */

    function transformNode(el, options) {
        var warn = options.warn || baseWarn;
        var staticClass = getAndRemoveAttr(el, 'class');
        if ("development" !== 'production' && staticClass) {
            var expression = parseText(staticClass, options.delimiters);
            if (expression) {
                warn(
                    "class=\"" + staticClass + "\": " +
                    'Interpolation inside attributes has been removed. ' +
                    'Use v-bind or the colon shorthand instead. For example, ' +
                    'instead of <div class="{{ val }}">, use <div :class="val">.'
                );
            }
        }
        if (staticClass) {
            el.staticClass = JSON.stringify(staticClass);
        }
        var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
        if (classBinding) {
            el.classBinding = classBinding;
        }
    }

    function genData(el) {
        var data = '';
        if (el.staticClass) {
            data += "staticClass:" + (el.staticClass) + ",";
        }
        if (el.classBinding) {
            data += "class:" + (el.classBinding) + ",";
        }
        return data
    }

    var klass$1 = {
        staticKeys: ['staticClass'],
        transformNode: transformNode,
        genData: genData
    };

    /*  */

    function transformNode$1(el, options) {
        var warn = options.warn || baseWarn;
        var staticStyle = getAndRemoveAttr(el, 'style');
        if (staticStyle) {
            /* istanbul ignore if */
            {
                var expression = parseText(staticStyle, options.delimiters);
                if (expression) {
                    warn(
                        "style=\"" + staticStyle + "\": " +
                        'Interpolation inside attributes has been removed. ' +
                        'Use v-bind or the colon shorthand instead. For example, ' +
                        'instead of <div style="{{ val }}">, use <div :style="val">.'
                    );
                }
            }
            el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
        }

        var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
        if (styleBinding) {
            el.styleBinding = styleBinding;
        }
    }

    function genData$1(el) {
        var data = '';
        if (el.staticStyle) {
            data += "staticStyle:" + (el.staticStyle) + ",";
        }
        if (el.styleBinding) {
            data += "style:(" + (el.styleBinding) + "),";
        }
        return data
    }

    var style$1 = {
        staticKeys: ['staticStyle'],
        transformNode: transformNode$1,
        genData: genData$1
    };

    var modules$1 = [
        klass$1,
        style$1
    ];

    /*  */

    function text(el, dir) {
        if (dir.value) {
            addProp(el, 'textContent', ("_s(" + (dir.value) + ")"));
        }
    }

    /*  */

    function html(el, dir) {
        if (dir.value) {
            addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"));
        }
    }

    var directives$1 = {
        model: model,
        text: text,
        html: html
    };

    /*  */

    var isUnaryTag = makeMap(
        'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
        'link,meta,param,source,track,wbr'
    );

// Elements that you can, intentionally, leave open
// (and which close themselves)
    var canBeLeftOpenTag = makeMap(
        'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
    );

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
    var isNonPhrasingTag = makeMap(
        'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
        'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
        'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
        'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
        'title,tr,track'
    );

    /*  */

    var baseOptions = {
        expectHTML: true,
        modules: modules$1,
        directives: directives$1,
        isPreTag: isPreTag,
        isUnaryTag: isUnaryTag,
        mustUseProp: mustUseProp,
        canBeLeftOpenTag: canBeLeftOpenTag,
        isReservedTag: isReservedTag,
        getTagNamespace: getTagNamespace,
        staticKeys: genStaticKeys(modules$1)
    };

    /*  */

    var decoder;

    var he = {
        decode: function decode(html) {
            decoder = decoder || document.createElement('div');
            decoder.innerHTML = html;
            return decoder.textContent
        }
    };

    /**
     * Not type-checking this file because it's mostly vendor code.
     */

    /*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

// Regular Expressions for parsing tags and attributes
    var singleAttrIdentifier = /([^\s"'<>/=]+)/;
    var singleAttrAssign = /(?:=)/;
    var singleAttrValues = [
        // attr value double quotes
        /"([^"]*)"+/.source,
        // attr value, single quotes
        /'([^']*)'+/.source,
        // attr value, no quotes
        /([^\s"'=<>`]+)/.source
    ];
    var attribute = new RegExp(
        '^\\s*' + singleAttrIdentifier.source +
        '(?:\\s*(' + singleAttrAssign.source + ')' +
        '\\s*(?:' + singleAttrValues.join('|') + '))?'
    );

// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
    var ncname = '[a-zA-Z_][\\w\\-\\.]*';
    var qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')';
    var startTagOpen = new RegExp('^<' + qnameCapture);
    var startTagClose = /^\s*(\/?)>/;
    var endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>');
    var doctype = /^<!DOCTYPE [^>]+>/i;
    var comment = /^<!--/;
    var conditionalComment = /^<!\[/;

    var IS_REGEX_CAPTURING_BROKEN = false;
    'x'.replace(/x(.)?/g, function (m, g) {
        IS_REGEX_CAPTURING_BROKEN = g === '';
    });

// Special Elements (can contain anything)
    var isPlainTextElement = makeMap('script,style,textarea', true);
    var reCache = {};

    var decodingMap = {
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&amp;': '&',
        '&#10;': '\n'
    };
    var encodedAttr = /&(?:lt|gt|quot|amp);/g;
    var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10);/g;

// #5992
    var isIgnoreNewlineTag = makeMap('pre,textarea', true);
    var shouldIgnoreFirstNewline = function (tag, html) {
        return tag && isIgnoreNewlineTag(tag) && html[0] === '\n';
    };

    function decodeAttr(value, shouldDecodeNewlines) {
        var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
        return value.replace(re, function (match) {
            return decodingMap[match];
        })
    }

    function parseHTML(html, options) {
        var stack = [];
        var expectHTML = options.expectHTML;
        var isUnaryTag$$1 = options.isUnaryTag || no;
        var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
        var index = 0;
        var last, lastTag;
        while (html) {
            last = html;
            // Make sure we're not in a plaintext content element like script/style
            if (!lastTag || !isPlainTextElement(lastTag)) {
                if (shouldIgnoreFirstNewline(lastTag, html)) {
                    advance(1);
                }
                var textEnd = html.indexOf('<');
                if (textEnd === 0) {
                    // Comment:
                    if (comment.test(html)) {
                        var commentEnd = html.indexOf('-->');

                        if (commentEnd >= 0) {
                            if (options.shouldKeepComment) {
                                options.comment(html.substring(4, commentEnd));
                            }
                            advance(commentEnd + 3);
                            continue
                        }
                    }

                    // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
                    if (conditionalComment.test(html)) {
                        var conditionalEnd = html.indexOf(']>');

                        if (conditionalEnd >= 0) {
                            advance(conditionalEnd + 2);
                            continue
                        }
                    }

                    // Doctype:
                    var doctypeMatch = html.match(doctype);
                    if (doctypeMatch) {
                        advance(doctypeMatch[0].length);
                        continue
                    }

                    // End tag:
                    var endTagMatch = html.match(endTag);
                    if (endTagMatch) {
                        var curIndex = index;
                        advance(endTagMatch[0].length);
                        parseEndTag(endTagMatch[1], curIndex, index);
                        continue
                    }

                    // Start tag:
                    var startTagMatch = parseStartTag();
                    if (startTagMatch) {
                        handleStartTag(startTagMatch);
                        continue
                    }
                }

                var text = (void 0), rest = (void 0), next = (void 0);
                if (textEnd >= 0) {
                    rest = html.slice(textEnd);
                    while (
                        !endTag.test(rest) &&
                        !startTagOpen.test(rest) &&
                        !comment.test(rest) &&
                        !conditionalComment.test(rest)
                        ) {
                        // < in plain text, be forgiving and treat it as text
                        next = rest.indexOf('<', 1);
                        if (next < 0) {
                            break
                        }
                        textEnd += next;
                        rest = html.slice(textEnd);
                    }
                    text = html.substring(0, textEnd);
                    advance(textEnd);
                }

                if (textEnd < 0) {
                    text = html;
                    html = '';
                }

                if (options.chars && text) {
                    options.chars(text);
                }
            } else {
                var endTagLength = 0;
                var stackedTag = lastTag.toLowerCase();
                var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
                var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
                    endTagLength = endTag.length;
                    if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
                        text = text
                            .replace(/<!--([\s\S]*?)-->/g, '$1')
                            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
                    }
                    if (shouldIgnoreFirstNewline(stackedTag, text)) {
                        text = text.slice(1);
                    }
                    if (options.chars) {
                        options.chars(text);
                    }
                    return ''
                });
                index += html.length - rest$1.length;
                html = rest$1;
                parseEndTag(stackedTag, index - endTagLength, index);
            }

            if (html === last) {
                options.chars && options.chars(html);
                if ("development" !== 'production' && !stack.length && options.warn) {
                    options.warn(("Mal-formatted tag at end of template: \"" + html + "\""));
                }
                break
            }
        }

        // Clean up any remaining tags
        parseEndTag();

        function advance(n) {
            index += n;
            html = html.substring(n);
        }

        function parseStartTag() {
            var start = html.match(startTagOpen);
            if (start) {
                var match = {
                    tagName: start[1],
                    attrs: [],
                    start: index
                };
                advance(start[0].length);
                var end, attr;
                while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                    advance(attr[0].length);
                    match.attrs.push(attr);
                }
                if (end) {
                    match.unarySlash = end[1];
                    advance(end[0].length);
                    match.end = index;
                    return match
                }
            }
        }

        function handleStartTag(match) {
            var tagName = match.tagName;
            var unarySlash = match.unarySlash;

            if (expectHTML) {
                if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
                    parseEndTag(lastTag);
                }
                if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
                    parseEndTag(tagName);
                }
            }

            var unary = isUnaryTag$$1(tagName) || !!unarySlash;

            var l = match.attrs.length;
            var attrs = new Array(l);
            for (var i = 0; i < l; i++) {
                var args = match.attrs[i];
                // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
                if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
                    if (args[3] === '') {
                        delete args[3];
                    }
                    if (args[4] === '') {
                        delete args[4];
                    }
                    if (args[5] === '') {
                        delete args[5];
                    }
                }
                var value = args[3] || args[4] || args[5] || '';
                attrs[i] = {
                    name: args[1],
                    value: decodeAttr(
                        value,
                        options.shouldDecodeNewlines
                    )
                };
            }

            if (!unary) {
                stack.push({tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs});
                lastTag = tagName;
            }

            if (options.start) {
                options.start(tagName, attrs, unary, match.start, match.end);
            }
        }

        function parseEndTag(tagName, start, end) {
            var pos, lowerCasedTagName;
            if (start == null) {
                start = index;
            }
            if (end == null) {
                end = index;
            }

            if (tagName) {
                lowerCasedTagName = tagName.toLowerCase();
            }

            // Find the closest opened tag of the same type
            if (tagName) {
                for (pos = stack.length - 1; pos >= 0; pos--) {
                    if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                        break
                    }
                }
            } else {
                // If no tag name is provided, clean shop
                pos = 0;
            }

            if (pos >= 0) {
                // Close all the open elements, up the stack
                for (var i = stack.length - 1; i >= pos; i--) {
                    if ("development" !== 'production' &&
                        (i > pos || !tagName) &&
                        options.warn
                    ) {
                        options.warn(
                            ("tag <" + (stack[i].tag) + "> has no matching end tag.")
                        );
                    }
                    if (options.end) {
                        options.end(stack[i].tag, start, end);
                    }
                }

                // Remove the open elements from the stack
                stack.length = pos;
                lastTag = pos && stack[pos - 1].tag;
            } else if (lowerCasedTagName === 'br') {
                if (options.start) {
                    options.start(tagName, [], true, start, end);
                }
            } else if (lowerCasedTagName === 'p') {
                if (options.start) {
                    options.start(tagName, [], false, start, end);
                }
                if (options.end) {
                    options.end(tagName, start, end);
                }
            }
        }
    }

    /*  */

    var onRE = /^@|^v-on:/;
    var dirRE = /^v-|^@|^:/;
    var forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;
    var forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/;

    var argRE = /:(.*)$/;
    var bindRE = /^:|^v-bind:/;
    var modifierRE = /\.[^.]+/g;

    var decodeHTMLCached = cached(he.decode);

// configurable state
    var warn$2;
    var delimiters;
    var transforms;
    var preTransforms;
    var postTransforms;
    var platformIsPreTag;
    var platformMustUseProp;
    var platformGetTagNamespace;

    /**
     * Convert HTML string to AST.
     */
    function parse(
        template,
        options
    ) {
        warn$2 = options.warn || baseWarn;

        platformIsPreTag = options.isPreTag || no;
        platformMustUseProp = options.mustUseProp || no;
        platformGetTagNamespace = options.getTagNamespace || no;

        transforms = pluckModuleFunction(options.modules, 'transformNode');
        preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
        postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

        delimiters = options.delimiters;

        var stack = [];
        var preserveWhitespace = options.preserveWhitespace !== false;
        var root;
        var currentParent;
        var inVPre = false;
        var inPre = false;
        var warned = false;

        function warnOnce(msg) {
            if (!warned) {
                warned = true;
                warn$2(msg);
            }
        }

        function endPre(element) {
            // check pre state
            if (element.pre) {
                inVPre = false;
            }
            if (platformIsPreTag(element.tag)) {
                inPre = false;
            }
        }

        parseHTML(template, {
            warn: warn$2,
            expectHTML: options.expectHTML,
            isUnaryTag: options.isUnaryTag,
            canBeLeftOpenTag: options.canBeLeftOpenTag,
            shouldDecodeNewlines: options.shouldDecodeNewlines,
            shouldKeepComment: options.comments,
            start: function start(tag, attrs, unary) {
                // check namespace.
                // inherit parent ns if there is one
                var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

                // handle IE svg bug
                /* istanbul ignore if */
                if (isIE && ns === 'svg') {
                    attrs = guardIESVGBug(attrs);
                }

                var element = {
                    type: 1,
                    tag: tag,
                    attrsList: attrs,
                    attrsMap: makeAttrsMap(attrs),
                    parent: currentParent,
                    children: []
                };
                if (ns) {
                    element.ns = ns;
                }

                if (isForbiddenTag(element) && !isServerRendering()) {
                    element.forbidden = true;
                    "development" !== 'production' && warn$2(
                        'Templates should only be responsible for mapping the state to the ' +
                        'UI. Avoid placing tags with side-effects in your templates, such as ' +
                        "<" + tag + ">" + ', as they will not be parsed.'
                    );
                }

                // apply pre-transforms
                for (var i = 0; i < preTransforms.length; i++) {
                    preTransforms[i](element, options);
                }

                if (!inVPre) {
                    processPre(element);
                    if (element.pre) {
                        inVPre = true;
                    }
                }
                if (platformIsPreTag(element.tag)) {
                    inPre = true;
                }
                if (inVPre) {
                    processRawAttrs(element);
                } else {
                    processFor(element);
                    processIf(element);
                    processOnce(element);
                    processKey(element);

                    // determine whether this is a plain element after
                    // removing structural attributes
                    element.plain = !element.key && !attrs.length;

                    processRef(element);
                    processSlot(element);
                    processComponent(element);
                    for (var i$1 = 0; i$1 < transforms.length; i$1++) {
                        transforms[i$1](element, options);
                    }
                    processAttrs(element);
                }

                function checkRootConstraints(el) {
                    {
                        if (el.tag === 'slot' || el.tag === 'template') {
                            warnOnce(
                                "Cannot use <" + (el.tag) + "> as component root element because it may " +
                                'contain multiple nodes.'
                            );
                        }
                        if (el.attrsMap.hasOwnProperty('v-for')) {
                            warnOnce(
                                'Cannot use v-for on stateful component root element because ' +
                                'it renders multiple elements.'
                            );
                        }
                    }
                }

                // tree management
                if (!root) {
                    root = element;
                    checkRootConstraints(root);
                } else if (!stack.length) {
                    // allow root elements with v-if, v-else-if and v-else
                    if (root.if && (element.elseif || element.else)) {
                        checkRootConstraints(element);
                        addIfCondition(root, {
                            exp: element.elseif,
                            block: element
                        });
                    } else {
                        warnOnce(
                            "Component template should contain exactly one root element. " +
                            "If you are using v-if on multiple elements, " +
                            "use v-else-if to chain them instead."
                        );
                    }
                }
                if (currentParent && !element.forbidden) {
                    if (element.elseif || element.else) {
                        processIfConditions(element, currentParent);
                    } else if (element.slotScope) { // scoped slot
                        currentParent.plain = false;
                        var name = element.slotTarget || '"default"';
                        (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
                    } else {
                        currentParent.children.push(element);
                        element.parent = currentParent;
                    }
                }
                if (!unary) {
                    currentParent = element;
                    stack.push(element);
                } else {
                    endPre(element);
                }
                // apply post-transforms
                for (var i$2 = 0; i$2 < postTransforms.length; i$2++) {
                    postTransforms[i$2](element, options);
                }
            },

            end: function end() {
                // remove trailing whitespace
                var element = stack[stack.length - 1];
                var lastNode = element.children[element.children.length - 1];
                if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
                    element.children.pop();
                }
                // pop stack
                stack.length -= 1;
                currentParent = stack[stack.length - 1];
                endPre(element);
            },

            chars: function chars(text) {
                if (!currentParent) {
                    {
                        if (text === template) {
                            warnOnce(
                                'Component template requires a root element, rather than just text.'
                            );
                        } else if ((text = text.trim())) {
                            warnOnce(
                                ("text \"" + text + "\" outside root element will be ignored.")
                            );
                        }
                    }
                    return
                }
                // IE textarea placeholder bug
                /* istanbul ignore if */
                if (isIE &&
                    currentParent.tag === 'textarea' &&
                    currentParent.attrsMap.placeholder === text
                ) {
                    return
                }
                var children = currentParent.children;
                text = inPre || text.trim()
                    ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
                    // only preserve whitespace if its not right after a starting tag
                    : preserveWhitespace && children.length ? ' ' : '';
                if (text) {
                    var expression;
                    if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
                        children.push({
                            type: 2,
                            expression: expression,
                            text: text
                        });
                    } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
                        children.push({
                            type: 3,
                            text: text
                        });
                    }
                }
            },
            comment: function comment(text) {
                currentParent.children.push({
                    type: 3,
                    text: text,
                    isComment: true
                });
            }
        });
        return root
    }

    function processPre(el) {
        if (getAndRemoveAttr(el, 'v-pre') != null) {
            el.pre = true;
        }
    }

    function processRawAttrs(el) {
        var l = el.attrsList.length;
        if (l) {
            var attrs = el.attrs = new Array(l);
            for (var i = 0; i < l; i++) {
                attrs[i] = {
                    name: el.attrsList[i].name,
                    value: JSON.stringify(el.attrsList[i].value)
                };
            }
        } else if (!el.pre) {
            // non root node in pre blocks with no attributes
            el.plain = true;
        }
    }

    function processKey(el) {
        var exp = getBindingAttr(el, 'key');
        if (exp) {
            if ("development" !== 'production' && el.tag === 'template') {
                warn$2("<template> cannot be keyed. Place the key on real elements instead.");
            }
            el.key = exp;
        }
    }

    function processRef(el) {
        var ref = getBindingAttr(el, 'ref');
        if (ref) {
            el.ref = ref;
            el.refInFor = checkInFor(el);
        }
    }

    function processFor(el) {
        var exp;
        if ((exp = getAndRemoveAttr(el, 'v-for'))) {
            var inMatch = exp.match(forAliasRE);
            if (!inMatch) {
                "development" !== 'production' && warn$2(
                    ("Invalid v-for expression: " + exp)
                );
                return
            }
            el.for = inMatch[2].trim();
            var alias = inMatch[1].trim();
            var iteratorMatch = alias.match(forIteratorRE);
            if (iteratorMatch) {
                el.alias = iteratorMatch[1].trim();
                el.iterator1 = iteratorMatch[2].trim();
                if (iteratorMatch[3]) {
                    el.iterator2 = iteratorMatch[3].trim();
                }
            } else {
                el.alias = alias;
            }
        }
    }

    function processIf(el) {
        var exp = getAndRemoveAttr(el, 'v-if');
        if (exp) {
            el.if = exp;
            addIfCondition(el, {
                exp: exp,
                block: el
            });
        } else {
            if (getAndRemoveAttr(el, 'v-else') != null) {
                el.else = true;
            }
            var elseif = getAndRemoveAttr(el, 'v-else-if');
            if (elseif) {
                el.elseif = elseif;
            }
        }
    }

    function processIfConditions(el, parent) {
        var prev = findPrevElement(parent.children);
        if (prev && prev.if) {
            addIfCondition(prev, {
                exp: el.elseif,
                block: el
            });
        } else {
            warn$2(
                "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
                "used on element <" + (el.tag) + "> without corresponding v-if."
            );
        }
    }

    function findPrevElement(children) {
        var i = children.length;
        while (i--) {
            if (children[i].type === 1) {
                return children[i]
            } else {
                if ("development" !== 'production' && children[i].text !== ' ') {
                    warn$2(
                        "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
                        "will be ignored."
                    );
                }
                children.pop();
            }
        }
    }

    function addIfCondition(el, condition) {
        if (!el.ifConditions) {
            el.ifConditions = [];
        }
        el.ifConditions.push(condition);
    }

    function processOnce(el) {
        var once$$1 = getAndRemoveAttr(el, 'v-once');
        if (once$$1 != null) {
            el.once = true;
        }
    }

    function processSlot(el) {
        if (el.tag === 'slot') {
            el.slotName = getBindingAttr(el, 'name');
            if ("development" !== 'production' && el.key) {
                warn$2(
                    "`key` does not work on <slot> because slots are abstract outlets " +
                    "and can possibly expand into multiple elements. " +
                    "Use the key on a wrapping element instead."
                );
            }
        } else {
            var slotTarget = getBindingAttr(el, 'slot');
            if (slotTarget) {
                el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
            }
            if (el.tag === 'template') {
                el.slotScope = getAndRemoveAttr(el, 'scope');
            }
        }
    }

    function processComponent(el) {
        var binding;
        if ((binding = getBindingAttr(el, 'is'))) {
            el.component = binding;
        }
        if (getAndRemoveAttr(el, 'inline-template') != null) {
            el.inlineTemplate = true;
        }
    }

    function processAttrs(el) {
        var list = el.attrsList;
        var i, l, name, rawName, value, modifiers, isProp;
        for (i = 0, l = list.length; i < l; i++) {
            name = rawName = list[i].name;
            value = list[i].value;
            if (dirRE.test(name)) {
                // mark element as dynamic
                el.hasBindings = true;
                // modifiers
                modifiers = parseModifiers(name);
                if (modifiers) {
                    name = name.replace(modifierRE, '');
                }
                if (bindRE.test(name)) { // v-bind
                    name = name.replace(bindRE, '');
                    value = parseFilters(value);
                    isProp = false;
                    if (modifiers) {
                        if (modifiers.prop) {
                            isProp = true;
                            name = camelize(name);
                            if (name === 'innerHtml') {
                                name = 'innerHTML';
                            }
                        }
                        if (modifiers.camel) {
                            name = camelize(name);
                        }
                        if (modifiers.sync) {
                            addHandler(
                                el,
                                ("update:" + (camelize(name))),
                                genAssignmentCode(value, "$event")
                            );
                        }
                    }
                    if (!el.component && (
                        isProp || platformMustUseProp(el.tag, el.attrsMap.type, name)
                    )) {
                        addProp(el, name, value);
                    } else {
                        addAttr(el, name, value);
                    }
                } else if (onRE.test(name)) { // v-on
                    name = name.replace(onRE, '');
                    addHandler(el, name, value, modifiers, false, warn$2);
                } else { // normal directives
                    name = name.replace(dirRE, '');
                    // parse arg
                    var argMatch = name.match(argRE);
                    var arg = argMatch && argMatch[1];
                    if (arg) {
                        name = name.slice(0, -(arg.length + 1));
                    }
                    addDirective(el, name, rawName, value, arg, modifiers);
                    if ("development" !== 'production' && name === 'model') {
                        checkForAliasModel(el, value);
                    }
                }
            } else {
                // literal attribute
                {
                    var expression = parseText(value, delimiters);
                    if (expression) {
                        warn$2(
                            name + "=\"" + value + "\": " +
                            'Interpolation inside attributes has been removed. ' +
                            'Use v-bind or the colon shorthand instead. For example, ' +
                            'instead of <div id="{{ val }}">, use <div :id="val">.'
                        );
                    }
                }
                addAttr(el, name, JSON.stringify(value));
            }
        }
    }

    function checkInFor(el) {
        var parent = el;
        while (parent) {
            if (parent.for !== undefined) {
                return true
            }
            parent = parent.parent;
        }
        return false
    }

    function parseModifiers(name) {
        var match = name.match(modifierRE);
        if (match) {
            var ret = {};
            match.forEach(function (m) {
                ret[m.slice(1)] = true;
            });
            return ret
        }
    }

    function makeAttrsMap(attrs) {
        var map = {};
        for (var i = 0, l = attrs.length; i < l; i++) {
            if (
                "development" !== 'production' &&
                map[attrs[i].name] && !isIE && !isEdge
            ) {
                warn$2('duplicate attribute: ' + attrs[i].name);
            }
            map[attrs[i].name] = attrs[i].value;
        }
        return map
    }

// for script (e.g. type="x/template") or style, do not decode content
    function isTextTag(el) {
        return el.tag === 'script' || el.tag === 'style'
    }

    function isForbiddenTag(el) {
        return (
            el.tag === 'style' ||
            (el.tag === 'script' && (
                !el.attrsMap.type ||
                el.attrsMap.type === 'text/javascript'
            ))
        )
    }

    var ieNSBug = /^xmlns:NS\d+/;
    var ieNSPrefix = /^NS\d+:/;

    /* istanbul ignore next */
    function guardIESVGBug(attrs) {
        var res = [];
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            if (!ieNSBug.test(attr.name)) {
                attr.name = attr.name.replace(ieNSPrefix, '');
                res.push(attr);
            }
        }
        return res
    }

    function checkForAliasModel(el, value) {
        var _el = el;
        while (_el) {
            if (_el.for && _el.alias === value) {
                warn$2(
                    "<" + (el.tag) + " v-model=\"" + value + "\">: " +
                    "You are binding v-model directly to a v-for iteration alias. " +
                    "This will not be able to modify the v-for source array because " +
                    "writing to the alias is like modifying a function local variable. " +
                    "Consider using an array of objects and use v-model on an object property instead."
                );
            }
            _el = _el.parent;
        }
    }

    /*  */

    var isStaticKey;
    var isPlatformReservedTag;

    var genStaticKeysCached = cached(genStaticKeys$1);

    /**
     * Goal of the optimizer: walk the generated template AST tree
     * and detect sub-trees that are purely static, i.e. parts of
     * the DOM that never needs to change.
     *
     * Once we detect these sub-trees, we can:
     *
     * 1. Hoist them into constants, so that we no longer need to
     *    create fresh nodes for them on each re-render;
     * 2. Completely skip them in the patching process.
     */
    function optimize(root, options) {
        if (!root) {
            return
        }
        isStaticKey = genStaticKeysCached(options.staticKeys || '');
        isPlatformReservedTag = options.isReservedTag || no;
        // first pass: mark all non-static nodes.
        markStatic$1(root);
        // second pass: mark static roots.
        markStaticRoots(root, false);
    }

    function genStaticKeys$1(keys) {
        return makeMap(
            'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
            (keys ? ',' + keys : '')
        )
    }

    function markStatic$1(node) {
        node.static = isStatic(node);
        if (node.type === 1) {
            // do not make component slot content static. this avoids
            // 1. components not able to mutate slot nodes
            // 2. static slot content fails for hot-reloading
            if (
                !isPlatformReservedTag(node.tag) &&
                node.tag !== 'slot' &&
                node.attrsMap['inline-template'] == null
            ) {
                return
            }
            for (var i = 0, l = node.children.length; i < l; i++) {
                var child = node.children[i];
                markStatic$1(child);
                if (!child.static) {
                    node.static = false;
                }
            }
            if (node.ifConditions) {
                for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
                    var block = node.ifConditions[i$1].block;
                    markStatic$1(block);
                    if (!block.static) {
                        node.static = false;
                    }
                }
            }
        }
    }

    function markStaticRoots(node, isInFor) {
        if (node.type === 1) {
            if (node.static || node.once) {
                node.staticInFor = isInFor;
            }
            // For a node to qualify as a static root, it should have children that
            // are not just static text. Otherwise the cost of hoisting out will
            // outweigh the benefits and it's better off to just always render it fresh.
            if (node.static && node.children.length && !(
                node.children.length === 1 &&
                node.children[0].type === 3
            )) {
                node.staticRoot = true;
                return
            } else {
                node.staticRoot = false;
            }
            if (node.children) {
                for (var i = 0, l = node.children.length; i < l; i++) {
                    markStaticRoots(node.children[i], isInFor || !!node.for);
                }
            }
            if (node.ifConditions) {
                for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
                    markStaticRoots(node.ifConditions[i$1].block, isInFor);
                }
            }
        }
    }

    function isStatic(node) {
        if (node.type === 2) { // expression
            return false
        }
        if (node.type === 3) { // text
            return true
        }
        return !!(node.pre || (
            !node.hasBindings && // no dynamic bindings
            !node.if && !node.for && // not v-if or v-for or v-else
            !isBuiltInTag(node.tag) && // not a built-in
            isPlatformReservedTag(node.tag) && // not a component
            !isDirectChildOfTemplateFor(node) &&
            Object.keys(node).every(isStaticKey)
        ))
    }

    function isDirectChildOfTemplateFor(node) {
        while (node.parent) {
            node = node.parent;
            if (node.tag !== 'template') {
                return false
            }
            if (node.for) {
                return true
            }
        }
        return false
    }

    /*  */

    var fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/;
    var simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/;

// keyCode aliases
    var keyCodes = {
        esc: 27,
        tab: 9,
        enter: 13,
        space: 32,
        up: 38,
        left: 37,
        right: 39,
        down: 40,
        'delete': [8, 46]
    };

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
    var genGuard = function (condition) {
        return ("if(" + condition + ")return null;");
    };

    var modifierCode = {
        stop: '$event.stopPropagation();',
        prevent: '$event.preventDefault();',
        self: genGuard("$event.target !== $event.currentTarget"),
        ctrl: genGuard("!$event.ctrlKey"),
        shift: genGuard("!$event.shiftKey"),
        alt: genGuard("!$event.altKey"),
        meta: genGuard("!$event.metaKey"),
        left: genGuard("'button' in $event && $event.button !== 0"),
        middle: genGuard("'button' in $event && $event.button !== 1"),
        right: genGuard("'button' in $event && $event.button !== 2")
    };

    function genHandlers(
        events,
        isNative,
        warn
    ) {
        var res = isNative ? 'nativeOn:{' : 'on:{';
        for (var name in events) {
            var handler = events[name];
            // #5330: warn click.right, since right clicks do not actually fire click events.
            if ("development" !== 'production' &&
                name === 'click' &&
                handler && handler.modifiers && handler.modifiers.right
            ) {
                warn(
                    "Use \"contextmenu\" instead of \"click.right\" since right clicks " +
                    "do not actually fire \"click\" events."
                );
            }
            res += "\"" + name + "\":" + (genHandler(name, handler)) + ",";
        }
        return res.slice(0, -1) + '}'
    }

    function genHandler(
        name,
        handler
    ) {
        if (!handler) {
            return 'function(){}'
        }

        if (Array.isArray(handler)) {
            return ("[" + (handler.map(function (handler) {
                return genHandler(name, handler);
            }).join(',')) + "]")
        }

        var isMethodPath = simplePathRE.test(handler.value);
        var isFunctionExpression = fnExpRE.test(handler.value);

        if (!handler.modifiers) {
            return isMethodPath || isFunctionExpression
                ? handler.value
                : ("function($event){" + (handler.value) + "}") // inline statement
        } else {
            var code = '';
            var genModifierCode = '';
            var keys = [];
            for (var key in handler.modifiers) {
                if (modifierCode[key]) {
                    genModifierCode += modifierCode[key];
                    // left/right
                    if (keyCodes[key]) {
                        keys.push(key);
                    }
                } else {
                    keys.push(key);
                }
            }
            if (keys.length) {
                code += genKeyFilter(keys);
            }
            // Make sure modifiers like prevent and stop get executed after key filtering
            if (genModifierCode) {
                code += genModifierCode;
            }
            var handlerCode = isMethodPath
                ? handler.value + '($event)'
                : isFunctionExpression
                    ? ("(" + (handler.value) + ")($event)")
                    : handler.value;
            return ("function($event){" + code + handlerCode + "}")
        }
    }

    function genKeyFilter(keys) {
        return ("if(!('button' in $event)&&" + (keys.map(genFilterCode).join('&&')) + ")return null;")
    }

    function genFilterCode(key) {
        var keyVal = parseInt(key, 10);
        if (keyVal) {
            return ("$event.keyCode!==" + keyVal)
        }
        var alias = keyCodes[key];
        return ("_k($event.keyCode," + (JSON.stringify(key)) + (alias ? ',' + JSON.stringify(alias) : '') + ")")
    }

    /*  */

    function on(el, dir) {
        if ("development" !== 'production' && dir.modifiers) {
            warn("v-on without argument does not support modifiers.");
        }
        el.wrapListeners = function (code) {
            return ("_g(" + code + "," + (dir.value) + ")");
        };
    }

    /*  */

    function bind$1(el, dir) {
        el.wrapData = function (code) {
            return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")
        };
    }

    /*  */

    var baseDirectives = {
        on: on,
        bind: bind$1,
        cloak: noop
    };

    /*  */

    var CodegenState = function CodegenState(options) {
        this.options = options;
        this.warn = options.warn || baseWarn;
        this.transforms = pluckModuleFunction(options.modules, 'transformCode');
        this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
        this.directives = extend(extend({}, baseDirectives), options.directives);
        var isReservedTag = options.isReservedTag || no;
        this.maybeComponent = function (el) {
            return !isReservedTag(el.tag);
        };
        this.onceId = 0;
        this.staticRenderFns = [];
    };


    function generate(
        ast,
        options
    ) {
        var state = new CodegenState(options);
        var code = ast ? genElement(ast, state) : '_c("div")';
        return {
            render: ("with(this){return " + code + "}"),
            staticRenderFns: state.staticRenderFns
        }
    }

    function genElement(el, state) {
        if (el.staticRoot && !el.staticProcessed) {
            return genStatic(el, state)
        } else if (el.once && !el.onceProcessed) {
            return genOnce(el, state)
        } else if (el.for && !el.forProcessed) {
            return genFor(el, state)
        } else if (el.if && !el.ifProcessed) {
            return genIf(el, state)
        } else if (el.tag === 'template' && !el.slotTarget) {
            return genChildren(el, state) || 'void 0'
        } else if (el.tag === 'slot') {
            return genSlot(el, state)
        } else {
            // component or element
            var code;
            if (el.component) {
                code = genComponent(el.component, el, state);
            } else {
                var data = el.plain ? undefined : genData$2(el, state);

                var children = el.inlineTemplate ? null : genChildren(el, state, true);
                code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
            }
            // module transforms
            for (var i = 0; i < state.transforms.length; i++) {
                code = state.transforms[i](el, code);
            }
            return code
        }
    }

// hoist static sub-trees out
    function genStatic(el, state) {
        el.staticProcessed = true;
        state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
        return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
    }

// v-once
    function genOnce(el, state) {
        el.onceProcessed = true;
        if (el.if && !el.ifProcessed) {
            return genIf(el, state)
        } else if (el.staticInFor) {
            var key = '';
            var parent = el.parent;
            while (parent) {
                if (parent.for) {
                    key = parent.key;
                    break
                }
                parent = parent.parent;
            }
            if (!key) {
                "development" !== 'production' && state.warn(
                    "v-once can only be used inside v-for that is keyed. "
                );
                return genElement(el, state)
            }
            return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + (key ? ("," + key) : "") + ")")
        } else {
            return genStatic(el, state)
        }
    }

    function genIf(
        el,
        state,
        altGen,
        altEmpty
    ) {
        el.ifProcessed = true; // avoid recursion
        return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
    }

    function genIfConditions(
        conditions,
        state,
        altGen,
        altEmpty
    ) {
        if (!conditions.length) {
            return altEmpty || '_e()'
        }

        var condition = conditions.shift();
        if (condition.exp) {
            return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
        } else {
            return ("" + (genTernaryExp(condition.block)))
        }

        // v-if with v-once should generate code like (a)?_m(0):_m(1)
        function genTernaryExp(el) {
            return altGen
                ? altGen(el, state)
                : el.once
                    ? genOnce(el, state)
                    : genElement(el, state)
        }
    }

    function genFor(
        el,
        state,
        altGen,
        altHelper
    ) {
        var exp = el.for;
        var alias = el.alias;
        var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
        var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

        if ("development" !== 'production' &&
            state.maybeComponent(el) &&
            el.tag !== 'slot' &&
            el.tag !== 'template' &&
            !el.key
        ) {
            state.warn(
                "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
                "v-for should have explicit keys. " +
                "See https://vuejs.org/guide/list.html#key for more info.",
                true /* tip */
            );
        }

        el.forProcessed = true; // avoid recursion
        return (altHelper || '_l') + "((" + exp + ")," +
            "function(" + alias + iterator1 + iterator2 + "){" +
            "return " + ((altGen || genElement)(el, state)) +
            '})'
    }

    function genData$2(el, state) {
        var data = '{';

        // directives first.
        // directives may mutate the el's other properties before they are generated.
        var dirs = genDirectives(el, state);
        if (dirs) {
            data += dirs + ',';
        }

        // key
        if (el.key) {
            data += "key:" + (el.key) + ",";
        }
        // ref
        if (el.ref) {
            data += "ref:" + (el.ref) + ",";
        }
        if (el.refInFor) {
            data += "refInFor:true,";
        }
        // pre
        if (el.pre) {
            data += "pre:true,";
        }
        // record original tag name for components using "is" attribute
        if (el.component) {
            data += "tag:\"" + (el.tag) + "\",";
        }
        // module data generation functions
        for (var i = 0; i < state.dataGenFns.length; i++) {
            data += state.dataGenFns[i](el);
        }
        // attributes
        if (el.attrs) {
            data += "attrs:{" + (genProps(el.attrs)) + "},";
        }
        // DOM props
        if (el.props) {
            data += "domProps:{" + (genProps(el.props)) + "},";
        }
        // event handlers
        if (el.events) {
            data += (genHandlers(el.events, false, state.warn)) + ",";
        }
        if (el.nativeEvents) {
            data += (genHandlers(el.nativeEvents, true, state.warn)) + ",";
        }
        // slot target
        if (el.slotTarget) {
            data += "slot:" + (el.slotTarget) + ",";
        }
        // scoped slots
        if (el.scopedSlots) {
            data += (genScopedSlots(el.scopedSlots, state)) + ",";
        }
        // component v-model
        if (el.model) {
            data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
        }
        // inline-template
        if (el.inlineTemplate) {
            var inlineTemplate = genInlineTemplate(el, state);
            if (inlineTemplate) {
                data += inlineTemplate + ",";
            }
        }
        data = data.replace(/,$/, '') + '}';
        // v-bind data wrap
        if (el.wrapData) {
            data = el.wrapData(data);
        }
        // v-on data wrap
        if (el.wrapListeners) {
            data = el.wrapListeners(data);
        }
        return data
    }

    function genDirectives(el, state) {
        var dirs = el.directives;
        if (!dirs) {
            return
        }
        var res = 'directives:[';
        var hasRuntime = false;
        var i, l, dir, needRuntime;
        for (i = 0, l = dirs.length; i < l; i++) {
            dir = dirs[i];
            needRuntime = true;
            var gen = state.directives[dir.name];
            if (gen) {
                // compile-time directive that manipulates AST.
                // returns true if it also needs a runtime counterpart.
                needRuntime = !!gen(el, dir, state.warn);
            }
            if (needRuntime) {
                hasRuntime = true;
                res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:\"" + (dir.arg) + "\"") : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
            }
        }
        if (hasRuntime) {
            return res.slice(0, -1) + ']'
        }
    }

    function genInlineTemplate(el, state) {
        var ast = el.children[0];
        if ("development" !== 'production' && (
            el.children.length > 1 || ast.type !== 1
        )) {
            state.warn('Inline-template components must have exactly one child element.');
        }
        if (ast.type === 1) {
            var inlineRenderFns = generate(ast, state.options);
            return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) {
                return ("function(){" + code + "}");
            }).join(',')) + "]}")
        }
    }

    function genScopedSlots(
        slots,
        state
    ) {
        return ("scopedSlots:_u([" + (Object.keys(slots).map(function (key) {
            return genScopedSlot(key, slots[key], state)
        }).join(',')) + "])")
    }

    function genScopedSlot(
        key,
        el,
        state
    ) {
        if (el.for && !el.forProcessed) {
            return genForScopedSlot(key, el, state)
        }
        return "{key:" + key + ",fn:function(" + (String(el.attrsMap.scope)) + "){" +
            "return " + (el.tag === 'template'
                ? genChildren(el, state) || 'void 0'
                : genElement(el, state)) + "}}"
    }

    function genForScopedSlot(
        key,
        el,
        state
    ) {
        var exp = el.for;
        var alias = el.alias;
        var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
        var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';
        el.forProcessed = true; // avoid recursion
        return "_l((" + exp + ")," +
            "function(" + alias + iterator1 + iterator2 + "){" +
            "return " + (genScopedSlot(key, el, state)) +
            '})'
    }

    function genChildren(
        el,
        state,
        checkSkip,
        altGenElement,
        altGenNode
    ) {
        var children = el.children;
        if (children.length) {
            var el$1 = children[0];
            // optimize single v-for
            if (children.length === 1 &&
                el$1.for &&
                el$1.tag !== 'template' &&
                el$1.tag !== 'slot'
            ) {
                return (altGenElement || genElement)(el$1, state)
            }
            var normalizationType = checkSkip
                ? getNormalizationType(children, state.maybeComponent)
                : 0;
            var gen = altGenNode || genNode;
            return ("[" + (children.map(function (c) {
                return gen(c, state);
            }).join(',')) + "]" + (normalizationType ? ("," + normalizationType) : ''))
        }
    }

// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
    function getNormalizationType(
        children,
        maybeComponent
    ) {
        var res = 0;
        for (var i = 0; i < children.length; i++) {
            var el = children[i];
            if (el.type !== 1) {
                continue
            }
            if (needsNormalization(el) ||
                (el.ifConditions && el.ifConditions.some(function (c) {
                    return needsNormalization(c.block);
                }))) {
                res = 2;
                break
            }
            if (maybeComponent(el) ||
                (el.ifConditions && el.ifConditions.some(function (c) {
                    return maybeComponent(c.block);
                }))) {
                res = 1;
            }
        }
        return res
    }

    function needsNormalization(el) {
        return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
    }

    function genNode(node, state) {
        if (node.type === 1) {
            return genElement(node, state)
        }
        if (node.type === 3 && node.isComment) {
            return genComment(node)
        } else {
            return genText(node)
        }
    }

    function genText(text) {
        return ("_v(" + (text.type === 2
            ? text.expression // no need for () because already wrapped in _s()
            : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
    }

    function genComment(comment) {
        return ("_e('" + (comment.text) + "')")
    }

    function genSlot(el, state) {
        var slotName = el.slotName || '"default"';
        var children = genChildren(el, state);
        var res = "_t(" + slotName + (children ? ("," + children) : '');
        var attrs = el.attrs && ("{" + (el.attrs.map(function (a) {
            return ((camelize(a.name)) + ":" + (a.value));
        }).join(',')) + "}");
        var bind$$1 = el.attrsMap['v-bind'];
        if ((attrs || bind$$1) && !children) {
            res += ",null";
        }
        if (attrs) {
            res += "," + attrs;
        }
        if (bind$$1) {
            res += (attrs ? '' : ',null') + "," + bind$$1;
        }
        return res + ')'
    }

// componentName is el.component, take it as argument to shun flow's pessimistic refinement
    function genComponent(
        componentName,
        el,
        state
    ) {
        var children = el.inlineTemplate ? null : genChildren(el, state, true);
        return ("_c(" + componentName + "," + (genData$2(el, state)) + (children ? ("," + children) : '') + ")")
    }

    function genProps(props) {
        var res = '';
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            res += "\"" + (prop.name) + "\":" + (transformSpecialNewlines(prop.value)) + ",";
        }
        return res.slice(0, -1)
    }

// #3895, #4268
    function transformSpecialNewlines(text) {
        return text
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')
    }

    /*  */

// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed
    var prohibitedKeywordRE = new RegExp('\\b' + (
        'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
        'super,throw,while,yield,delete,export,import,return,switch,default,' +
        'extends,finally,continue,debugger,function,arguments'
    ).split(',').join('\\b|\\b') + '\\b');

// these unary operators should not be used as property/method names
    var unaryOperatorsRE = new RegExp('\\b' + (
        'delete,typeof,void'
    ).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

// check valid identifier for v-for
    var identRE = /[A-Za-z_$][\w$]*/;

// strip strings in expressions
    var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

// detect problematic expressions in a template
    function detectErrors(ast) {
        var errors = [];
        if (ast) {
            checkNode(ast, errors);
        }
        return errors
    }

    function checkNode(node, errors) {
        if (node.type === 1) {
            for (var name in node.attrsMap) {
                if (dirRE.test(name)) {
                    var value = node.attrsMap[name];
                    if (value) {
                        if (name === 'v-for') {
                            checkFor(node, ("v-for=\"" + value + "\""), errors);
                        } else if (onRE.test(name)) {
                            checkEvent(value, (name + "=\"" + value + "\""), errors);
                        } else {
                            checkExpression(value, (name + "=\"" + value + "\""), errors);
                        }
                    }
                }
            }
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    checkNode(node.children[i], errors);
                }
            }
        } else if (node.type === 2) {
            checkExpression(node.expression, node.text, errors);
        }
    }

    function checkEvent(exp, text, errors) {
        var stipped = exp.replace(stripStringRE, '');
        var keywordMatch = stipped.match(unaryOperatorsRE);
        if (keywordMatch && stipped.charAt(keywordMatch.index - 1) !== '$') {
            errors.push(
                "avoid using JavaScript unary operator as property name: " +
                "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim())
            );
        }
        checkExpression(exp, text, errors);
    }

    function checkFor(node, text, errors) {
        checkExpression(node.for || '', text, errors);
        checkIdentifier(node.alias, 'v-for alias', text, errors);
        checkIdentifier(node.iterator1, 'v-for iterator', text, errors);
        checkIdentifier(node.iterator2, 'v-for iterator', text, errors);
    }

    function checkIdentifier(ident, type, text, errors) {
        if (typeof ident === 'string' && !identRE.test(ident)) {
            errors.push(("invalid " + type + " \"" + ident + "\" in expression: " + (text.trim())));
        }
    }

    function checkExpression(exp, text, errors) {
        try {
            new Function(("return " + exp));
        } catch (e) {
            var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
            if (keywordMatch) {
                errors.push(
                    "avoid using JavaScript keyword as property name: " +
                    "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim())
                );
            } else {
                errors.push(("invalid expression: " + (text.trim())));
            }
        }
    }

    /*  */

    function createFunction(code, errors) {
        try {
            return new Function(code)
        } catch (err) {
            errors.push({err: err, code: code});
            return noop
        }
    }

    function createCompileToFunctionFn(compile) {
        var cache = Object.create(null);

        return function compileToFunctions(
            template,
            options,
            vm
        ) {
            options = options || {};

            /* istanbul ignore if */
            {
                // detect possible CSP restriction
                try {
                    new Function('return 1');
                } catch (e) {
                    if (e.toString().match(/unsafe-eval|CSP/)) {
                        warn(
                            'It seems you are using the standalone build of Vue.js in an ' +
                            'environment with Content Security Policy that prohibits unsafe-eval. ' +
                            'The template compiler cannot work in this environment. Consider ' +
                            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
                            'templates into render functions.'
                        );
                    }
                }
            }

            // check cache
            var key = options.delimiters
                ? String(options.delimiters) + template
                : template;
            if (cache[key]) {
                return cache[key]
            }

            // compile
            var compiled = compile(template, options);

            // check compilation errors/tips
            {
                if (compiled.errors && compiled.errors.length) {
                    warn(
                        "Error compiling template:\n\n" + template + "\n\n" +
                        compiled.errors.map(function (e) {
                            return ("- " + e);
                        }).join('\n') + '\n',
                        vm
                    );
                }
                if (compiled.tips && compiled.tips.length) {
                    compiled.tips.forEach(function (msg) {
                        return tip(msg, vm);
                    });
                }
            }

            // turn code into functions
            var res = {};
            var fnGenErrors = [];
            res.render = createFunction(compiled.render, fnGenErrors);
            res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
                return createFunction(code, fnGenErrors)
            });

            // check function generation errors.
            // this should only happen if there is a bug in the compiler itself.
            // mostly for codegen development use
            /* istanbul ignore if */
            {
                if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
                    warn(
                        "Failed to generate render function:\n\n" +
                        fnGenErrors.map(function (ref) {
                            var err = ref.err;
                            var code = ref.code;

                            return ((err.toString()) + " in\n\n" + code + "\n");
                        }).join('\n'),
                        vm
                    );
                }
            }

            return (cache[key] = res)
        }
    }

    /*  */

    function createCompilerCreator(baseCompile) {
        return function createCompiler(baseOptions) {
            function compile(
                template,
                options
            ) {
                var finalOptions = Object.create(baseOptions);
                var errors = [];
                var tips = [];
                finalOptions.warn = function (msg, tip) {
                    (tip ? tips : errors).push(msg);
                };

                if (options) {
                    // merge custom modules
                    if (options.modules) {
                        finalOptions.modules =
                            (baseOptions.modules || []).concat(options.modules);
                    }
                    // merge custom directives
                    if (options.directives) {
                        finalOptions.directives = extend(
                            Object.create(baseOptions.directives),
                            options.directives
                        );
                    }
                    // copy other options
                    for (var key in options) {
                        if (key !== 'modules' && key !== 'directives') {
                            finalOptions[key] = options[key];
                        }
                    }
                }

                var compiled = baseCompile(template, finalOptions);
                {
                    errors.push.apply(errors, detectErrors(compiled.ast));
                }
                compiled.errors = errors;
                compiled.tips = tips;
                return compiled
            }

            return {
                compile: compile,
                compileToFunctions: createCompileToFunctionFn(compile)
            }
        }
    }

    /*  */

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
    var createCompiler = createCompilerCreator(function baseCompile(
        template,
        options
    ) {
        var ast = parse(template.trim(), options);
        optimize(ast, options);
        var code = generate(ast, options);
        return {
            ast: ast,
            render: code.render,
            staticRenderFns: code.staticRenderFns
        }
    });

    /*  */

    var ref$1 = createCompiler(baseOptions);
    var compileToFunctions = ref$1.compileToFunctions;

    /*  */

    var idToTemplate = cached(function (id) {
        var el = query(id);
        return el && el.innerHTML
    });

    var mount = Vue$3.prototype.$mount;
    Vue$3.prototype.$mount = function (
        el,
        hydrating
    ) {
        el = el && query(el);

        /* istanbul ignore if */
        if (el === document.body || el === document.documentElement) {
            "development" !== 'production' && warn(
                "Do not mount Vue to <html> or <body> - mount to normal elements instead."
            );
            return this
        }

        var options = this.$options;
        // resolve template/el and convert to render function
        if (!options.render) {
            var template = options.template;
            if (template) {
                if (typeof template === 'string') {
                    if (template.charAt(0) === '#') {
                        template = idToTemplate(template);
                        /* istanbul ignore if */
                        if ("development" !== 'production' && !template) {
                            warn(
                                ("Template element not found or is empty: " + (options.template)),
                                this
                            );
                        }
                    }
                } else if (template.nodeType) {
                    template = template.innerHTML;
                } else {
                    {
                        warn('invalid template option:' + template, this);
                    }
                    return this
                }
            } else if (el) {
                template = getOuterHTML(el);
            }
            if (template) {
                /* istanbul ignore if */
                if ("development" !== 'production' && config.performance && mark) {
                    mark('compile');
                }

                var ref = compileToFunctions(template, {
                    shouldDecodeNewlines: shouldDecodeNewlines,
                    delimiters: options.delimiters,
                    comments: options.comments
                }, this);
                var render = ref.render;
                var staticRenderFns = ref.staticRenderFns;
                options.render = render;
                options.staticRenderFns = staticRenderFns;

                /* istanbul ignore if */
                if ("development" !== 'production' && config.performance && mark) {
                    mark('compile end');
                    measure(((this._name) + " compile"), 'compile', 'compile end');
                }
            }
        }
        return mount.call(this, el, hydrating)
    };

    /**
     * Get outerHTML of elements, taking care
     * of SVG elements in IE as well.
     */
    function getOuterHTML(el) {
        if (el.outerHTML) {
            return el.outerHTML
        } else {
            var container = document.createElement('div');
            container.appendChild(el.cloneNode(true));
            return container.innerHTML
        }
    }

    Vue$3.compile = compileToFunctions;

    return Vue$3;

})));
!function a(b, c, d) {
    function e(g, h) {
        if (!c[g]) {
            if (!b[g]) {
                var i = "function" == typeof require && require;
                if (!h && i) return i(g, !0);
                if (f) return f(g, !0);
                var j = new Error("Cannot find module '" + g + "'");
                throw j.code = "MODULE_NOT_FOUND", j
            }
            var k = c[g] = {exports: {}};
            b[g][0].call(k.exports, function (a) {
                var c = b[g][1][a];
                return e(c ? c : a)
            }, k, k.exports, a, b, c, d)
        }
        return c[g].exports
    }

    for (var f = "function" == typeof require && require, g = 0; g < d.length; g++) e(d[g]);
    return e
}({
    1: [function (a, b) {
        function c() {
        }

        var d = b.exports = {};
        d.nextTick = function () {
            var a = "undefined" != typeof window && window.setImmediate,
                b = "undefined" != typeof window && window.postMessage && window.addEventListener;
            if (a) return function (a) {
                return window.setImmediate(a)
            };
            if (b) {
                var c = [];
                return window.addEventListener("message", function (a) {
                    var b = a.source;
                    if ((b === window || null === b) && "process-tick" === a.data && (a.stopPropagation(), c.length > 0)) {
                        var d = c.shift();
                        d()
                    }
                }, !0), function (a) {
                    c.push(a), window.postMessage("process-tick", "*")
                }
            }
            return function (a) {
                setTimeout(a, 0)
            }
        }(), d.title = "browser", d.browser = !0, d.env = {}, d.argv = [], d.on = c, d.addListener = c, d.once = c, d.off = c, d.removeListener = c, d.removeAllListeners = c, d.emit = c, d.binding = function () {
            throw new Error("process.binding is not supported")
        }, d.cwd = function () {
            return "/"
        }, d.chdir = function () {
            throw new Error("process.chdir is not supported")
        }
    }, {}], 2: [function (a, b) {
        "use strict";

        function c(a) {
            function b(a) {
                return null === i ? void k.push(a) : void f(function () {
                    var b = i ? a.onFulfilled : a.onRejected;
                    if (null === b) return void (i ? a.resolve : a.reject)(j);
                    var c;
                    try {
                        c = b(j)
                    } catch (d) {
                        return void a.reject(d)
                    }
                    a.resolve(c)
                })
            }

            function c(a) {
                try {
                    if (a === l) throw new TypeError("A promise cannot be resolved with itself.");
                    if (a && ("object" == typeof a || "function" == typeof a)) {
                        var b = a.then;
                        if ("function" == typeof b) return void e(b.bind(a), c, g)
                    }
                    i = !0, j = a, h()
                } catch (d) {
                    g(d)
                }
            }

            function g(a) {
                i = !1, j = a, h()
            }

            function h() {
                for (var a = 0, c = k.length; c > a; a++) b(k[a]);
                k = null
            }

            if ("object" != typeof this) throw new TypeError("Promises must be constructed via new");
            if ("function" != typeof a) throw new TypeError("not a function");
            var i = null, j = null, k = [], l = this;
            this.then = function (a, c) {
                return new l.constructor(function (e, f) {
                    b(new d(a, c, e, f))
                })
            }, e(a, c, g)
        }

        function d(a, b, c, d) {
            this.onFulfilled = "function" == typeof a ? a : null, this.onRejected = "function" == typeof b ? b : null, this.resolve = c, this.reject = d
        }

        function e(a, b, c) {
            var d = !1;
            try {
                a(function (a) {
                    d || (d = !0, b(a))
                }, function (a) {
                    d || (d = !0, c(a))
                })
            } catch (e) {
                if (d) return;
                d = !0, c(e)
            }
        }

        var f = a("asap");
        b.exports = c
    }, {asap: 4}], 3: [function (a, b) {
        "use strict";

        function c(a) {
            this.then = function (b) {
                return "function" != typeof b ? this : new d(function (c, d) {
                    e(function () {
                        try {
                            c(b(a))
                        } catch (e) {
                            d(e)
                        }
                    })
                })
            }
        }

        var d = a("./core.js"), e = a("asap");
        b.exports = d, c.prototype = d.prototype;
        var f = new c(!0), g = new c(!1), h = new c(null), i = new c(void 0), j = new c(0), k = new c("");
        d.resolve = function (a) {
            if (a instanceof d) return a;
            if (null === a) return h;
            if (void 0 === a) return i;
            if (a === !0) return f;
            if (a === !1) return g;
            if (0 === a) return j;
            if ("" === a) return k;
            if ("object" == typeof a || "function" == typeof a) try {
                var b = a.then;
                if ("function" == typeof b) return new d(b.bind(a))
            } catch (e) {
                return new d(function (a, b) {
                    b(e)
                })
            }
            return new c(a)
        }, d.all = function (a) {
            var b = Array.prototype.slice.call(a);
            return new d(function (a, c) {
                function d(f, g) {
                    try {
                        if (g && ("object" == typeof g || "function" == typeof g)) {
                            var h = g.then;
                            if ("function" == typeof h) return void h.call(g, function (a) {
                                d(f, a)
                            }, c)
                        }
                        b[f] = g, 0 === --e && a(b)
                    } catch (i) {
                        c(i)
                    }
                }

                if (0 === b.length) return a([]);
                for (var e = b.length, f = 0; f < b.length; f++) d(f, b[f])
            })
        }, d.reject = function (a) {
            return new d(function (b, c) {
                c(a)
            })
        }, d.race = function (a) {
            return new d(function (b, c) {
                a.forEach(function (a) {
                    d.resolve(a).then(b, c)
                })
            })
        }, d.prototype["catch"] = function (a) {
            return this.then(null, a)
        }
    }, {"./core.js": 2, asap: 4}], 4: [function (a, b) {
        (function (a) {
            function c() {
                for (; e.next;) {
                    e = e.next;
                    var a = e.task;
                    e.task = void 0;
                    var b = e.domain;
                    b && (e.domain = void 0, b.enter());
                    try {
                        a()
                    } catch (d) {
                        if (i) throw b && b.exit(), setTimeout(c, 0), b && b.enter(), d;
                        setTimeout(function () {
                            throw d
                        }, 0)
                    }
                    b && b.exit()
                }
                g = !1
            }

            function d(b) {
                f = f.next = {task: b, domain: i && a.domain, next: null}, g || (g = !0, h())
            }

            var e = {task: void 0, next: null}, f = e, g = !1, h = void 0, i = !1;
            if ("undefined" != typeof a && a.nextTick) i = !0, h = function () {
                a.nextTick(c)
            }; else if ("function" == typeof setImmediate) h = "undefined" != typeof window ? setImmediate.bind(window, c) : function () {
                setImmediate(c)
            }; else if ("undefined" != typeof MessageChannel) {
                var j = new MessageChannel;
                j.port1.onmessage = c, h = function () {
                    j.port2.postMessage(0)
                }
            } else h = function () {
                setTimeout(c, 0)
            };
            b.exports = d
        }).call(this, a("_process"))
    }, {_process: 1}], 5: [function () {
        "function" != typeof Promise.prototype.done && (Promise.prototype.done = function () {
            var a = arguments.length ? this.then.apply(this, arguments) : this;
            a.then(null, function (a) {
                setTimeout(function () {
                    throw a
                }, 0)
            })
        })
    }, {}], 6: [function (a) {
        a("asap");
        "undefined" == typeof Promise && (Promise = a("./lib/core.js"), a("./lib/es6-extensions.js")), a("./polyfill-done.js")
    }, {"./lib/core.js": 2, "./lib/es6-extensions.js": 3, "./polyfill-done.js": 5, asap: 4}]
}, {}, [6]);
!function (a, b) {
    function c(a) {
        Object.defineProperty(this, "val", {value: a.toString(), enumerable: !0}), this.gt = function (a) {
            return c.compare(this, a) > 0
        }, this.gte = function (a) {
            return c.compare(this, a) >= 0
        }, this.lt = function (a) {
            return c.compare(this, a) < 0
        }, this.lte = function (a) {
            return c.compare(this, a) <= 0
        }, this.eq = function (a) {
            return 0 === c.compare(this, a)
        }
    }

    b.env = b.env || {}, c.prototype.toString = function () {
        return this.val
    }, c.prototype.valueOf = function () {
        for (var a = this.val.split("."), b = [], c = 0; c < a.length; c++) {
            var d = parseInt(a[c], 10);
            isNaN(d) && (d = 0);
            var e = d.toString();
            e.length < 5 && (e = Array(6 - e.length).join("0") + e), b.push(e), 1 === b.length && b.push(".")
        }
        return parseFloat(b.join(""))
    }, c.compare = function (a, b) {
        a = a.toString().split("."), b = b.toString().split(".");
        for (var c = 0; c < a.length || c < b.length; c++) {
            var d = parseInt(a[c], 10), e = parseInt(b[c], 10);
            if (window.isNaN(d) && (d = 0), window.isNaN(e) && (e = 0), e > d) return -1;
            if (d > e) return 1
        }
        return 0
    }, b.version = function (a) {
        return new c(a)
    }
}(window, window.lib || (window.lib = {})), function (a, b) {
    b.env = b.env || {};
    var c = a.location.search.replace(/^\?/, "");
    if (b.env.params = {}, c) for (var d = c.split("&"), e = 0; e < d.length; e++) {
        d[e] = d[e].split("=");
        try {
            b.env.params[d[e][0]] = decodeURIComponent(d[e][1])
        } catch (f) {
            b.env.params[d[e][0]] = d[e][1]
        }
    }
}(window, window.lib || (window.lib = {})), function (a, b) {
    b.env = b.env || {};
    var c, d = a.navigator.userAgent;
    if (c = d.match(/Windows\sPhone\s(?:OS\s)?([\d\.]+)/)) b.env.os = {
        name: "Windows Phone",
        isWindowsPhone: !0,
        version: c[1]
    }; else if (d.match(/Safari/) && (c = d.match(/Android[\s\/]([\d\.]+)/))) b.env.os = {version: c[1]}, d.match(/Mobile\s+Safari/) ? (b.env.os.name = "Android", b.env.os.isAndroid = !0) : (b.env.os.name = "AndroidPad", b.env.os.isAndroidPad = !0); else if (c = d.match(/(iPhone|iPad|iPod)/)) {
        var e = c[1];
        (c = d.match(/OS ([\d_\.]+) like Mac OS X/)) && (b.env.os = {
            name: e,
            isIPhone: "iPhone" === e || "iPod" === e,
            isIPad: "iPad" === e,
            isIOS: !0,
            version: c[1].split("_").join(".")
        })
    }
    b.env.os || (b.env.os = {
        name: "unknown",
        version: "0.0.0"
    }), b.version && (b.env.os.version = b.version(b.env.os.version))
}(window, window.lib || (window.lib = {})), function (a, b) {
    b.env = b.env || {};
    var c, d = a.navigator.userAgent;
    (c = d.match(/(?:UCWEB|UCBrowser\/)([\d\.]+)/)) ? b.env.browser = {
        name: "UC",
        isUC: !0,
        version: c[1]
    } : (c = d.match(/MQQBrowser\/([\d\.]+)/)) ? b.env.browser = {
        name: "QQ",
        isQQ: !0,
        version: c[1]
    } : (c = d.match(/(?:Firefox|FxiOS)\/([\d\.]+)/)) ? b.env.browser = {
        name: "Firefox",
        isFirefox: !0,
        version: c[1]
    } : (c = d.match(/MSIE\s([\d\.]+)/)) || (c = d.match(/IEMobile\/([\d\.]+)/)) ? (b.env.browser = {version: c[1]}, d.match(/IEMobile/) ? (b.env.browser.name = "IEMobile", b.env.browser.isIEMobile = !0) : (b.env.browser.name = "IE", b.env.browser.isIE = !0), d.match(/Android|iPhone/) && (b.env.browser.isIELikeWebkit = !0)) : (c = d.match(/(?:Chrome|CriOS)\/([\d\.]+)/)) ? (b.env.browser = {
        name: "Chrome",
        isChrome: !0,
        version: c[1]
    }, d.match(/Version\/[\d+\.]+\s*Chrome/) && (b.env.browser.name = "Chrome Webview", b.env.browser.isWebview = !0)) : d.match(/Safari/) && (c = d.match(/Android[\s\/]([\d\.]+)/)) ? b.env.browser = {
        name: "Android",
        isAndroid: !0,
        version: c[1]
    } : d.match(/iPhone|iPad|iPod/) && (d.match(/Safari/) && (c = d.match(/Version\/([\d\.]+)/)) ? b.env.browser = {
        name: "Safari",
        isSafari: !0,
        version: c[1]
    } : (c = d.match(/OS ([\d_\.]+) like Mac OS X/)) && (b.env.browser = {
        name: "iOS Webview",
        isWebview: !0,
        version: c[1].replace(/\_/g, ".")
    })), b.env.browser || (b.env.browser = {
        name: "unknown",
        version: "0.0.0"
    }), b.version && (b.env.browser.version = b.version(b.env.browser.version))
}(window, window.lib || (window.lib = {})), function (a, b) {
    b.env = b.env || {};
    var c = a.navigator.userAgent;
    b.env.thirdapp = c.match(/Weibo/i) ? {
        appname: "Weibo",
        isWeibo: !0
    } : c.match(/MicroMessenger/i) ? {appname: "Weixin", isWeixin: !0} : !1
}(window, window.lib || (window.lib = {})), function (a, b) {
    b.env = b.env || {};
    var c, d, e = a.navigator.userAgent;
    (d = e.match(/WindVane[\/\s]([\d\.\_]+)/)) && (c = d[1]);
    var f = !1, g = "", h = "", i = "", j = a._ua_popLayer || "", k = !1, l = "";
    (d = e.match(/AliApp\(([A-Z\-]+)\/([\d\.]+)\)/i)) && (f = !0, g = d[1], i = d[2], h = g.indexOf("-PD") > 0 ? b.env.os.isIOS ? "iPad" : b.env.os.isAndroid ? "AndroidPad" : b.env.os.name : b.env.os.name), !g && e.indexOf("TBIOS") > 0 && (g = "TB"), j && (d = j.match(/PopLayer\/([\d\.]+)/i)) && (k = !0, l = d[1]), b.env.aliapp = f ? {
        windvane: b.version(c || "0.0.0"),
        appname: g || "unkown",
        version: b.version(i || "0.0.0"),
        platform: h || b.env.os.name,
        poplayer: k || !1,
        poplayerVersion: b.version(l || "0.0.0")
    } : !1, b.env.taobaoApp = b.env.aliapp
}(window, window.lib || (window.lib = {}));
!function (a, b) {
    function c() {
        var a = {}, b = new m(function (b, c) {
            a.resolve = b, a.reject = c
        });
        return a.promise = b, a
    }

    function d(a, b) {
        for (var c in b) void 0 === a[c] && (a[c] = b[c]);
        return a
    }

    function e(a) {
        var b = document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0] || document.firstElementChild || document;
        b.appendChild(a)
    }

    function f(a) {
        var b = [];
        for (var c in a) a[c] && b.push(c + "=" + encodeURIComponent(a[c]));
        return b.join("&")
    }

    function g(a) {
        function b(a, b) {
            return a << b | a >>> 32 - b
        }

        function c(a, b) {
            var c, d, e, f, g;
            return e = 2147483648 & a, f = 2147483648 & b, c = 1073741824 & a, d = 1073741824 & b, g = (1073741823 & a) + (1073741823 & b), c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f
        }

        function d(a, b, c) {
            return a & b | ~a & c
        }

        function e(a, b, c) {
            return a & c | b & ~c
        }

        function f(a, b, c) {
            return a ^ b ^ c
        }

        function g(a, b, c) {
            return b ^ (a | ~c)
        }

        function h(a, e, f, g, h, i, j) {
            return a = c(a, c(c(d(e, f, g), h), j)), c(b(a, i), e)
        }

        function i(a, d, f, g, h, i, j) {
            return a = c(a, c(c(e(d, f, g), h), j)), c(b(a, i), d)
        }

        function j(a, d, e, g, h, i, j) {
            return a = c(a, c(c(f(d, e, g), h), j)), c(b(a, i), d)
        }

        function k(a, d, e, f, h, i, j) {
            return a = c(a, c(c(g(d, e, f), h), j)), c(b(a, i), d)
        }

        function l(a) {
            for (var b, c = a.length, d = c + 8, e = (d - d % 64) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;) b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | a.charCodeAt(i) << h, i++;
            return b = (i - i % 4) / 4, h = i % 4 * 8, g[b] = g[b] | 128 << h, g[f - 2] = c << 3, g[f - 1] = c >>> 29, g
        }

        function m(a) {
            var b, c, d = "", e = "";
            for (c = 0; 3 >= c; c++) b = a >>> 8 * c & 255, e = "0" + b.toString(16), d += e.substr(e.length - 2, 2);
            return d
        }

        function n(a) {
            a = a.replace(/\r\n/g, "\n");
            for (var b = "", c = 0; c < a.length; c++) {
                var d = a.charCodeAt(c);
                128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192), b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224), b += String.fromCharCode(d >> 6 & 63 | 128), b += String.fromCharCode(63 & d | 128))
            }
            return b
        }

        var o, p, q, r, s, t, u, v, w, x = [], y = 7, z = 12, A = 17, B = 22, C = 5, D = 9, E = 14, F = 20, G = 4,
            H = 11, I = 16, J = 23, K = 6, L = 10, M = 15, N = 21;
        for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562383102, w = 271733878, o = 0; o < x.length; o += 16) p = t, q = u, r = v, s = w, t = h(t, u, v, w, x[o + 0], y, 3614090360), w = h(w, t, u, v, x[o + 1], z, 3905402710), v = h(v, w, t, u, x[o + 2], A, 606105819), u = h(u, v, w, t, x[o + 3], B, 3250441966), t = h(t, u, v, w, x[o + 4], y, 4118548399), w = h(w, t, u, v, x[o + 5], z, 1200080426), v = h(v, w, t, u, x[o + 6], A, 2821735955), u = h(u, v, w, t, x[o + 7], B, 4249261313), t = h(t, u, v, w, x[o + 8], y, 1770035416), w = h(w, t, u, v, x[o + 9], z, 2336552879), v = h(v, w, t, u, x[o + 10], A, 4294925233), u = h(u, v, w, t, x[o + 11], B, 2304563134), t = h(t, u, v, w, x[o + 12], y, 1804603682), w = h(w, t, u, v, x[o + 13], z, 4254626195), v = h(v, w, t, u, x[o + 14], A, 2792965006), u = h(u, v, w, t, x[o + 15], B, 1236535329), t = i(t, u, v, w, x[o + 1], C, 4129170786), w = i(w, t, u, v, x[o + 6], D, 3225465664), v = i(v, w, t, u, x[o + 11], E, 643717713), u = i(u, v, w, t, x[o + 0], F, 3921069994), t = i(t, u, v, w, x[o + 5], C, 3593408605), w = i(w, t, u, v, x[o + 10], D, 38016083), v = i(v, w, t, u, x[o + 15], E, 3634488961), u = i(u, v, w, t, x[o + 4], F, 3889429448), t = i(t, u, v, w, x[o + 9], C, 568446438), w = i(w, t, u, v, x[o + 14], D, 3275163606), v = i(v, w, t, u, x[o + 3], E, 4107603335), u = i(u, v, w, t, x[o + 8], F, 1163531501), t = i(t, u, v, w, x[o + 13], C, 2850285829), w = i(w, t, u, v, x[o + 2], D, 4243563512), v = i(v, w, t, u, x[o + 7], E, 1735328473), u = i(u, v, w, t, x[o + 12], F, 2368359562), t = j(t, u, v, w, x[o + 5], G, 4294588738), w = j(w, t, u, v, x[o + 8], H, 2272392833), v = j(v, w, t, u, x[o + 11], I, 1839030562), u = j(u, v, w, t, x[o + 14], J, 4259657740), t = j(t, u, v, w, x[o + 1], G, 2763975236), w = j(w, t, u, v, x[o + 4], H, 1272893353), v = j(v, w, t, u, x[o + 7], I, 4139469664), u = j(u, v, w, t, x[o + 10], J, 3200236656), t = j(t, u, v, w, x[o + 13], G, 681279174), w = j(w, t, u, v, x[o + 0], H, 3936430074), v = j(v, w, t, u, x[o + 3], I, 3572445317), u = j(u, v, w, t, x[o + 6], J, 76029189), t = j(t, u, v, w, x[o + 9], G, 3654602809), w = j(w, t, u, v, x[o + 12], H, 3873151461), v = j(v, w, t, u, x[o + 15], I, 530742520), u = j(u, v, w, t, x[o + 2], J, 3299628645), t = k(t, u, v, w, x[o + 0], K, 4096336452), w = k(w, t, u, v, x[o + 7], L, 1126891415), v = k(v, w, t, u, x[o + 14], M, 2878612391), u = k(u, v, w, t, x[o + 5], N, 4237533241), t = k(t, u, v, w, x[o + 12], K, 1700485571), w = k(w, t, u, v, x[o + 3], L, 2399980690), v = k(v, w, t, u, x[o + 10], M, 4293915773), u = k(u, v, w, t, x[o + 1], N, 2240044497), t = k(t, u, v, w, x[o + 8], K, 1873313359), w = k(w, t, u, v, x[o + 15], L, 4264355552), v = k(v, w, t, u, x[o + 6], M, 2734768916), u = k(u, v, w, t, x[o + 13], N, 1309151649), t = k(t, u, v, w, x[o + 4], K, 4149444226), w = k(w, t, u, v, x[o + 11], L, 3174756917), v = k(v, w, t, u, x[o + 2], M, 718787259), u = k(u, v, w, t, x[o + 9], N, 3951481745), t = c(t, p), u = c(u, q), v = c(v, r), w = c(w, s);
        var O = m(t) + m(u) + m(v) + m(w);
        return O.toLowerCase()
    }

    function h(a) {
        var b = new RegExp("(?:^|;\\s*)" + a + "\\=([^;]+)(?:;\\s*|$)").exec(document.cookie);
        return b ? b[1] : void 0
    }

    function i(a, b, c) {
        var d = new Date;
        d.setTime(d.getTime() - 864e5);
        var e = "/";
        doc.cookie = a + "=;path=" + e + ";domain=." + b + ";expires=" + d.toGMTString(), doc.cookie = a + "=;path=" + e + ";domain=." + c + "." + b + ";expires=" + d.toGMTString()
    }

    function j() {
        var b = a.location.hostname,
            c = ["taobao.net", "taobao.com", "tmall.com", "tmall.hk", "etao.com", "alibaba-inc.com"],
            d = new RegExp("([^.]*?)\\.?((?:" + c.join(")|(?:").replace(/\./g, "\\.") + "))", "i"),
            e = b.match(d) || [], f = e[2] || "taobao.com", g = e[1] || "m";
        "taobao.net" !== f || "x" !== g && "waptest" !== g && "daily" !== g ? "taobao.net" === f && "demo" === g ? g = "demo" : "alibaba-inc.com" === f && "zebra" === g ? g = "zebra" : "waptest" !== g && "wapa" !== g && "m" !== g && (g = "m") : g = "waptest";
        var h = "etao.com" === f ? "apie" : "api";
        h = "taobao.com" === f ? "acs" : h, r.mainDomain = f, r.subDomain = g, r.prefix = h
    }

    function k() {
        var b = a.navigator.userAgent, c = b.match(/WindVane[\/\s]([\d\.\_]+)/);
        c && (r.WindVaneVersion = c[1]);
        var d = b.match(/AliApp\(([^\/]+)\/([\d\.\_]+)\)/i);
        d && (r.AliAppName = d[1], r.AliAppVersion = d[2])
    }

    function l(a) {
        this.id = ++u, this.params = d(a || {}, {
            v: "*",
            data: {},
            type: "get",
            dataType: "jsonp"
        }), this.params.type = this.params.type.toLowerCase(), "object" == typeof this.params.data && (this.params.data = JSON.stringify(this.params.data)), this.middlewares = s.slice(0)
    }

    var m = a.Promise;
    if (!m) {
        var n = "当前浏览器不支持Promise，请在windows对象上挂载Promise对象可参考（http://gitlab.alibaba-inc.com/mtb/lib-es6polyfill/tree/master）中的解决方案";
        throw b.mtop = {ERROR: n}, new Error(n)
    }
    var o, p = m.resolve();
    try {
        o = a.localStorage, o.setItem("@private", "false")
    } catch (q) {
        o = !1
    }
    var r = {useAlipayJSBridge: !1}, s = [], t = {ERROR: -1, SUCCESS: 0, TOKEN_EXPIRED: 1, SESSION_EXPIRED: 2};
    j(), k();
    var u = 0;
    l.prototype.use = function (a) {
        if (!a) throw new Error("middleware is undefined");
        return this.middlewares.push(a), this
    }, l.prototype.__processRequestMethod = function (a) {
        var b = this.params, c = this.options;
        "get" === b.type && "jsonp" === b.dataType ? c.getJSONP = !0 : "get" === b.type && "originaljsonp" === b.dataType ? c.getOriginalJSONP = !0 : "get" === b.type && "json" === b.dataType ? c.getJSON = !0 : "post" === b.type && (c.postJSON = !0), a()
    }, l.prototype.__processRequestType = function (a) {
        var c = this, d = this.options;
        if (r.H5Request === !0 && (d.H5Request = !0), r.WindVaneRequest === !0 && (d.WindVaneRequest = !0), d.H5Request === !1 && d.WindVaneRequest === !0) {
            if (!b.windvane || parseFloat(d.WindVaneVersion) < 5.4) throw new Error("WINDVANE_NOT_FOUND::缺少WindVane环境")
        } else d.H5Request === !0 ? d.WindVaneRequest = !1 : "undefined" == typeof d.WindVaneRequest && "undefined" == typeof d.H5Request && (b.windvane && parseFloat(d.WindVaneVersion) >= 5.4 ? d.WindVaneRequest = !0 : d.H5Request = !0);
        a && a().then(function () {
            var a = d.retJson.ret;
            return a instanceof Array && (a = a.join(",")), d.WindVaneRequest === !0 && (!a || a.indexOf("HY_FAILED") > -1 || a.indexOf("HY_NO_HANDLER") > -1 || a.indexOf("HY_CLOSED") > -1 || a.indexOf("HY_EXCEPTION") > -1 || a.indexOf("HY_NO_PERMISSION") > -1) ? (r.H5Request = !0, c.__sequence([c.__processRequestType, c.__processToken, c.__processRequestUrl, c.__processUnitPrefix, c.middlewares, c.__processRequest])) : void 0
        })
    };
    var v = "_m_h5_tk", w = "_m_h5_tk_enc";
    l.prototype.__getTokenFromAlipay = function () {
        var b = c(), d = this.options, e = (a.navigator.userAgent, !!location.protocol.match(/^https?\:$/)),
            f = "AP" === d.AliAppName && parseFloat(d.AliAppVersion) >= 8.2;
        return d.useAlipayJSBridge === !0 && !e && f && a.AlipayJSBridge && a.AlipayJSBridge.call ? a.AlipayJSBridge.call("getMtopToken", function (a) {
            a && a.token && (d.token = a.token), b.resolve()
        }, function () {
            b.resolve()
        }) : b.resolve(), b.promise
    }, l.prototype.__getTokenFromCookie = function () {
        var a = this.options;
        return a.token = a.token || h(v), a.token && (a.token = a.token.split("_")[0]), m.resolve()
    }, l.prototype.__processToken = function (a) {
        var b = this, c = this.options;
        this.params;
        return c.token && delete c.token, c.WindVaneRequest !== !0 ? p.then(function () {
            return b.__getTokenFromAlipay()
        }).then(function () {
            return b.__getTokenFromCookie()
        }).then(a).then(function () {
            var a = c.retJson, d = a.ret;
            if (d instanceof Array && (d = d.join(",")), d.indexOf("TOKEN_EMPTY") > -1 || d.indexOf("TOKEN_EXOIRED") > -1) {
                if (c.maxRetryTimes = c.maxRetryTimes || 5, c.failTimes = c.failTimes || 0, c.H5Request && ++c.failTimes < c.maxRetryTimes) return b.__sequence([b.__processToken, b.__processRequestUrl, b.__processUnitPrefix, b.middlewares, b.__processRequest]);
                maxRetryTimes > 0 && (i(v, c.mainDomain, c.subDomain), i(w, c.mainDomain, c.subDomain)), a.retType = t.TOKEN_EXPIRED
            }
        }) : void a()
    }, l.prototype.__processRequestUrl = function (a) {
        var b = this.params, c = this.options;
        if (c.H5Request === !0) {
            var d = "//" + (c.prefix ? c.prefix + "." : "") + (c.subDomain ? c.subDomain + "." : "") + c.mainDomain + "/h5/" + b.api.toLowerCase() + "/" + b.v.toLowerCase() + "/",
                e = b.appKey || ("waptest" === c.subDomain ? "4272" : "12574478"), f = (new Date).getTime(),
                h = g(c.token + "&" + f + "&" + e + "&" + b.data), i = {appKey: e, t: f, sign: h},
                j = {data: b.data, ua: b.ua};
            Object.keys(b).forEach(function (a) {
                "undefined" == typeof i[a] && "undefined" == typeof j[a] && (i[a] = b[a])
            }), c.getJSONP ? i.type = "jsonp" : c.getOriginalJSONP ? i.type = "originaljsonp" : (c.getJSON || c.postJSON) && (i.type = "originaljson"), c.querystring = i, c.postdata = j, c.path = d
        }
        a()
    }, l.prototype.__processUnitPrefix = function (b) {
        var c = this.params, d = this.options;
        if (o && d.H5Request === !0) {
            var f = c.api, g = !1, i = h("_m_user_unitinfo_"), j = o.getItem("unitinfo");
            i && i.split("|")[0].indexOf("center") < 0 && j && j.indexOf(f.toLowerCase()) >= 0 && (g = i.split("|")[1]), d.h5UnitPrefix ? d.path = d.path.replace(/^\/\//, "//" + d.h5UnitPrefix) : g && d.path && (d.useAcsUnit === !0 || d.path.indexOf("taobao.com") > -1 ? d.path = d.path.replace(/^\/\//, "//" + g) : d.path = d.path.replace(/^\/\//, "//" + g + ".")), b().then(function () {
                if (o) {
                    var b = h("_m_unitapi_v_"), c = o.getItem("unitinfo");
                    if (b) {
                        var f = c ? JSON.parse(c) : {};
                        if (!c || b !== f.version) {
                            var g = !1, i = "//h5." + d.subDomain + ".taobao.com/js/mtop/unit/" + b + "/unitApi.js",
                                j = document.createElement("script");
                            j.src = i;
                            var k = function () {
                                g || (g = !0, j.onload = j.onerror = null, j.parentNode && j.parentNode.removeChild(j))
                            };
                            j.onerror = function () {
                                k()
                            }, a.jsonp_unitapi || (a.jsonp_unitapi = function (a) {
                                k(), o.setItem("unitinfo", JSON.stringify(a))
                            }), e(j)
                        }
                    }
                }
            })
        } else b()
    };
    var x = 0;
    l.prototype.__requestJSONP = function (a) {
        function b(a) {
            if (k && clearTimeout(k), l.parentNode && l.parentNode.removeChild(l), "TIMEOUT" === a) window[j] = function () {
                window[j] = void 0;
                try {
                    delete window[j]
                } catch (a) {
                }
            }; else {
                window[j] = void 0;
                try {
                    delete window[j]
                } catch (b) {
                }
            }
        }

        var d = c(), g = this.params, h = this.options, i = g.timeout || 2e4, j = "mtopjsonp" + ++x,
            k = setTimeout(function () {
                a("TIMEOUT::接口超时"), b("TIMEOUT")
            }, i);
        h.querystring.callback = j;
        var l = document.createElement("script");
        return l.src = h.path + "?" + f(h.querystring) + "&" + f(h.postdata), l.async = !0, l.onerror = function () {
            b("ABORT"), a("ABORT::接口异常退出")
        }, window[j] = function () {
            h.results = Array.prototype.slice.call(arguments), b(), d.resolve()
        }, e(l), d.promise
    }, l.prototype.__requestJSON = function (b) {
        function d(a) {
            k && clearTimeout(k), "TIMEOUT" === a && i.abort()
        }

        var e = c(), g = this.params, h = this.options, i = new a.XMLHttpRequest, j = g.timeout || 2e4,
            k = setTimeout(function () {
                b("TIMEOUT::接口超时"), d("TIMEOUT")
            }, j);
        i.onreadystatechange = function () {
            if (4 == i.readyState) {
                var a, c, f = i.status;
                if (f >= 200 && 300 > f || 304 == f) {
                    d(), a = i.responseText, c = i.getAllResponseHeaders() || "";
                    try {
                        a = /^\s*$/.test(a) ? {} : JSON.parse(a), a.responseHeaders = c, h.results = [a], e.resolve()
                    } catch (g) {
                        b("PARSE_JSON_ERROR::解析JSON失败")
                    }
                } else d("ABORT"), b("ABORT::接口异常退出")
            }
        };
        var l, m, n = h.path + "?" + f(h.querystring);
        if (h.getJSON ? (l = "GET", n += "&" + f(h.postdata)) : h.postJSON && (l = "POST", m = f(h.postdata)), i.open(l, n, !0), i.withCredentials = !0, i.setRequestHeader("Accept", "application/json"), i.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), g.headers) for (var o in g.headers) i.setRequestHeader(o, g.headers[o]);
        return i.send(m), e.promise
    }, l.prototype.__requestWindVane = function (a) {
        function d(a) {
            j.results = [a], h.resolve()
        }

        var e, f, g, h = c(), i = this.params, j = this.options, k = i.data, l = i.api, m = i.v, n = j.postJSON ? 1 : 0,
            o = j.getJSON || j.postJSON ? "originaljson" : "", p = "https" === location.protocol ? 1 : 0,
            q = i.isSec || 0, r = i.sessionOption || "AutoLoginOnly";
        if ("undefined" == typeof i.ecode) throw new Error("UNEXCEPT_PARAM_ECODE::缺少ecode参数");
        return e = parseInt(i.ecode), g = "undefined" != typeof i.timer ? parseInt(i.timer) : "undefined" != typeof i.timeout ? parseInt(i.timeout) : 2e4, f = 2 * g, b.windvane.call("MtopWVPlugin", "send", {
            api: l,
            v: m,
            post: String(n),
            type: o,
            isHttps: String(p),
            ecode: String(e),
            isSec: String(q),
            param: JSON.parse(k),
            timer: g,
            sessionOption: r,
            ext_headers: {referer: location.href}
        }, d, d, f), h.promise
    }, l.prototype.__processRequest = function (a, b) {
        var c = this;
        return p.then(function () {
            var a = c.options;
            if (a.H5Request && (a.getJSONP || a.getOriginalJSONP)) return c.__requestJSONP(b);
            if (a.H5Request && (a.getJSON || a.postJSON)) return c.__requestJSON(b);
            if (a.WindVaneRequest) return c.__requestWindVane(b);
            throw new Error("UNEXCEPT_REQUEST::错误的请求类型")
        }).then(a).then(function () {
            var a = c.options, b = (c.params, a.results[0]), d = b && b.ret || [];
            b.ret = d, d instanceof Array && (d = d.join(",")), d.indexOf("SUCCESS") > -1 ? b.retType = t.SUCCESS : b.retType = t.ERROR, a.retJson = b
        })
    }, l.prototype.__sequence = function (a) {
        function b(a) {
            if (a instanceof Array) a.forEach(b); else {
                var g, h = c(), i = c();
                e.push(function () {
                    return h = c(), g = a.call(d, function (a) {
                        return h.resolve(a), i.promise
                    }, function (a) {
                        return h.reject(a), i.promise
                    }), g && (g = g["catch"](function (a) {
                        h.reject(a)
                    })), h.promise
                }), f.push(function (a) {
                    return i.resolve(a), g
                })
            }
        }

        var d = this, e = [], f = [];
        a.forEach(b);
        for (var g, h = p; g = e.shift();) h = h.then(g);
        for (; g = f.pop();) h = h.then(g);
        return h
    };
    var y = function (a) {
        a()
    }, z = function (a) {
        a()
    };
    l.prototype.request = function (a) {
        var b = this;
        this.options = d(a || {}, r);
        var c = m.resolve([y, z]).then(function (a) {
            var c = a[0], d = a[1];
            return b.__sequence([c, b.__processRequestMethod, b.__processRequestType, b.__processToken, b.__processRequestUrl, b.__processUnitPrefix, b.middlewares, b.__processRequest, d])
        }).then(function () {
            var a = b.options.retJson;
            return a.retType !== t.SUCCESS ? m.reject(a) : b.options.successCallback ? void b.options.successCallback(a) : m.resolve(a)
        })["catch"](function (a) {
            var c;
            return a instanceof Error ? (console.error(a.stack), c = {
                ret: [a.message],
                stack: [a.stack],
                retJson: t.ERROR
            }) : c = "string" == typeof a ? {
                ret: [a],
                retJson: t.ERROR
            } : void 0 !== a ? a : b.options.retJson, b.options.failureCallback ? void b.options.failureCallback(c) : m.reject(c)
        });
        return this.__processRequestType(), b.options.H5Request && (b.constructor.__firstProcessor || (b.constructor.__firstProcessor = c), y = function (a) {
            b.constructor.__firstProcessor.then(a)["catch"](a)
        }), c
    }, b.mtop = function (a) {
        return new l(a)
    }, b.mtop.request = function (a, b, c) {
        var d = {
            H5Request: a.H5Request,
            WindVaneRequest: a.WindVaneRequest,
            LoginRequest: a.LoginRequest,
            AntiCreep: a.AntiCreep,
            AntiFlood: a.AntiFlood,
            successCallback: b,
            failureCallback: c || b
        };
        return new l(a).request(d)
    }, b.mtop.H5Request = function (a, b, c) {
        var d = {H5Request: !0, successCallback: b, failureCallback: c || b};
        return new l(a).request(d)
    }, b.mtop.middlewares = s, b.mtop.config = r, b.mtop.RESPONSE_TYPE = t, b.mtop.CLASS = l
}(window, window.lib || (window.lib = {})), function (a, b) {
    function c(a) {
        return a.preventDefault(), !1
    }

    function d(b, d) {
        var e = this, f = a.dpr || 1, g = document.createElement("div"),
            h = document.documentElement.getBoundingClientRect(), i = Math.max(h.width, window.innerWidth) / f,
            j = Math.max(h.height, window.innerHeight) / f;
        g.style.cssText = ["-webkit-transform:scale(" + f + ") translateZ(0)", "-ms-transform:scale(" + f + ") translateZ(0)", "transform:scale(" + f + ") translateZ(0)", "-webkit-transform-origin:0 0", "-ms-transform-origin:0 0", "transform-origin:0 0", "width:" + i + "px", "height:" + j + "px", "z-index:999999", "position:absolute", "left:0", "top:0px", "background:#FFF", "display:none"].join(";");
        var k = document.createElement("div");
        k.style.cssText = ["width:100%", "height:52px", "background:#EEE", "line-height:52px", "text-align:left", "box-sizing:border-box", "padding-left:20px", "position:absolute", "left:0", "top:0", "font-size:16px", "font-weight:bold", "color:#333"].join(";"), k.innerText = b;
        var l = document.createElement("a");
        l.style.cssText = ["display:block", "position:absolute", "right:0", "top:0", "height:52px", "line-height:52px", "padding:0 20px", "color:#999"].join(";"), l.innerText = "关闭";
        var m = document.createElement("iframe");
        m.style.cssText = ["width:100%", "height:100%", "border:0", "overflow:hidden"].join(";"), k.appendChild(l), g.appendChild(k), g.appendChild(m), document.body.appendChild(g), m.src = d, l.addEventListener("click", function () {
            e.hide();
            var a = document.createEvent("HTMLEvents");
            a.initEvent("close", !1, !1), g.dispatchEvent(a)
        }, !1), this.addEventListener = function () {
            g.addEventListener.apply(g, arguments)
        }, this.removeEventListener = function () {
            g.removeEventListener.apply(g, arguments)
        }, this.show = function () {
            document.addEventListener("touchmove", c, !1), g.style.display = "block", window.scrollTo(0, 0)
        }, this.hide = function () {
            document.removeEventListener("touchmove", c), window.scrollTo(0, -h.top), g.parentNode && g.parentNode.removeChild(g)
        }
    }

    function e(a) {
        var c = this, d = this.options;
        this.params;
        return a().then(function () {
            var a = d.retJson, e = a.ret;
            if (e instanceof Array && (e = e.join(",")), (e.indexOf("SESSION_EXPIRED") > -1 || e.indexOf("SID_INVALID") > -1 || e.indexOf("AUTH_REJECT") > -1 || e.indexOf("NEED_LOGIN") > -1) && (a.retType = k.SESSION_EXPIRED, !d.WindVaneRequest && (j.LoginRequest === !0 || d.LoginRequest === !0))) {
                if (!b.login) throw new Error("LOGIN_NOT_FOUND::缺少lib.login");
                return b.login.goLoginAsync().then(function (a) {
                    return c.__sequence([c.__processToken, c.__processRequestUrl, c.__processUnitPrefix, c.middlewares, c.__processRequest])
                })["catch"](function (a) {
                    throw"CANCEL" === a ? new Error("LOGIN_CANCEL::用户取消登录") : new Error("LOGIN_FAILURE::用户登录失败")
                })
            }
        })
    }

    function f(a) {
        var b = this.options;
        this.params;
        return b.AliAppName || b.AliAppVersion || j.AntiFlood !== !0 && b.AntiFlood !== !0 ? void a() : a().then(function () {
            var a = b.retJson, c = a.ret;
            c instanceof Array && (c = c.join(",")), c.indexOf("FAIL_SYS_USER_VALIDATE") > -1 && a.data.url && (location.href = a.data.url)
        })
    }

    function g(b) {
        var c = this, e = this.options, f = this.params;
        return f.forceAntiCreep !== !0 && (e.AliAppName || e.AliAppVersion) || j.AntiCreep !== !0 && e.AntiCreep !== !0 ? void b() : b().then(function () {
            var b = e.retJson, g = b.ret;
            return g instanceof Array && (g = g.join(",")), g.indexOf("RGV587_ERROR::SM") > -1 && b.data.url ? new h(function (e, g) {
                function h() {
                    k.removeEventListener("close", h), a.removeEventListener("message", i), g("USER_INPUT_CANCEL::用户取消输入")
                }

                function i(b) {
                    k.removeEventListener("close", h), a.removeEventListener("message", i), k.hide();
                    var d;
                    try {
                        d = JSON.parse(b.data) || {}
                    } catch (j) {
                    }
                    if (d && "child" === d.type) {
                        var l;
                        try {
                            l = JSON.parse(decodeURIComponent(d.content)), "string" == typeof l && (l = JSON.parse(l));
                            for (var m in l) f[m] = l[m];
                            c.__sequence([c.__processToken, c.__processRequestUrl, c.__processUnitPrefix, c.middlewares, c.__processRequest]).then(e)
                        } catch (j) {
                            g("USER_INPUT_FAILURE::用户输入失败")
                        }
                    } else e()
                }

                var j = b.data.url, k = new d("", j);
                k.addEventListener("close", i, !1), a.addEventListener("message", i, !1), k.show()
            }) : void 0
        })
    }

    if (!b || !b.mtop || b.mtop.ERROR) throw new Error("Mtop 初始化失败！请参考Mtop文档http://gitlab.alibaba-inc.com/mtb/lib-mtop");
    var h = a.Promise, i = b.mtop.CLASS, j = b.mtop.config, k = b.mtop.RESPONSE_TYPE;
    b.mtop.middlewares.push(e), b.mtop.loginRequest = function (a, b, c) {
        var d = {LoginRequest: !0, H5Request: !0, successCallback: b, failureCallback: c || b};
        return new i(a).request(d)
    }, b.mtop.antiFloodRequest = function (a, b, c) {
        var d = {AntiFlood: !0, successCallback: b, failureCallback: c || b};
        return new i(a).request(d)
    }, b.mtop.middlewares.push(f), b.mtop.antiCreepRequest = function (a, b, c) {
        var d = {AntiCreep: !0, successCallback: b, failureCallback: c || b};
        return new i(a).request(d)
    }, b.mtop.middlewares.push(g)
}(window, window.lib || (window.lib = {}));
!function (a, b, c) {
    function d(a) {
        var b = new RegExp("(?:^|;\\s*)" + a + "\\=([^;]+)(?:;\\s*|$)").exec(v.cookie);
        return b ? b[1] : c
    }

    function e(a) {
        return a.preventDefault(), !1
    }

    function f(b, c) {
        var d = this, f = a.dpr || 1, g = document.createElement("div"),
            h = document.documentElement.getBoundingClientRect(), i = Math.max(h.width, window.innerWidth) / f,
            j = Math.max(h.height, window.innerHeight) / f;
        g.style.cssText = ["-webkit-transform:scale(" + f + ") translateZ(0)", "-ms-transform:scale(" + f + ") translateZ(0)", "transform:scale(" + f + ") translateZ(0)", "-webkit-transform-origin:0 0", "-ms-transform-origin:0 0", "transform-origin:0 0", "width:" + i + "px", "height:" + j + "px", "z-index:999999", "position:absolute", "left:0", "top:0px", "background:#FFF", "display:none"].join(";");
        var k = document.createElement("div");
        k.style.cssText = ["width:100%", "height:52px", "background:#EEE", "line-height:52px", "text-align:left", "box-sizing:border-box", "padding-left:20px", "position:absolute", "left:0", "top:0", "font-size:16px", "font-weight:bold", "color:#333"].join(";"), k.innerText = b;
        var l = document.createElement("a");
        l.style.cssText = ["display:block", "position:absolute", "right:0", "top:0", "height:52px", "line-height:52px", "padding:0 20px", "color:#999"].join(";"), l.innerText = "关闭";
        var m = document.createElement("iframe");
        m.style.cssText = ["width:100%", "height:100%", "border:0", "overflow:hidden"].join(";"), k.appendChild(l), g.appendChild(k), g.appendChild(m), v.body.appendChild(g), m.src = c, l.addEventListener("click", function () {
            d.hide();
            var a = v.createEvent("HTMLEvents");
            a.initEvent("close", !1, !1), g.dispatchEvent(a)
        }, !1), this.addEventListener = function () {
            g.addEventListener.apply(g, arguments)
        }, this.removeEventListener = function () {
            g.removeEventListener.apply(g, arguments)
        }, this.show = function () {
            document.addEventListener("touchmove", e, !1), g.style.display = "block", window.scrollTo(0, 0)
        }, this.hide = function () {
            document.removeEventListener("touchmove", e), window.scrollTo(0, -h.top), v.body.removeChild(g)
        }
    }

    function g(a) {
        if (!a || "function" != typeof a || !b.mtop) {
            var d = this.getUserNick();
            return !!d
        }
        b.mtop.request({api: "mtop.user.getUserSimple", v: "1.0", data: {isSec: 0}, H5Request: !0}, function (d) {
            d.retType === b.mtop.RESPONSE_TYPE.SUCCESS ? a(!0, d) : d.retType === b.mtop.RESPONSE_TYPE.SESSION_EXPIRED ? a(!1, d) : a(c, d)
        })
    }

    function h(a) {
        var b;
        return u && (b = {}, b.promise = new u(function (a, c) {
            b.resolve = a, b.reject = c
        })), this.isLogin(function (c, d) {
            a && a(c, d), c === !0 ? b && b.resolve(d) : b && b.reject(d)
        }), b ? b.promise : void 0
    }

    function i(a) {
        if (!a || "function" != typeof a) {
            var b = "", e = d("_w_tb_nick"), f = d("_nk_") || d("snk"), g = d("sn");
            return e && e.length > 0 && "null" != e ? b = decodeURIComponent(e) : f && f.length > 0 && "null" != f ? b = unescape(unescape(f).replace(/\\u/g, "%u")) : g && g.length > 0 && "null" != g && (b = decodeURIComponent(g)), b = b.replace(/\</g, "&lt;").replace(/\>/g, "&gt;")
        }
        this.isLogin(function (b, d) {
            a(b === !0 && d && d.data && d.data.nick ? d.data.nick : b === !1 ? "" : c)
        })
    }

    function j(a) {
        var b;
        return u && (b = {}, b.promise = new u(function (a, c) {
            b.resolve = a, b.reject = c
        })), this.getUserNick(function (c) {
            a && a(c), c ? b && b.resolve(c) : b && b.reject()
        }), b ? b.promise : void 0
    }

    function k(a, c) {
        var d = "//" + G + "." + H.subDomain + "." + E + "/" + H[(a || "login") + "Name"];
        if (c) {
            var e = [];
            for (var f in c) e.push(f + "=" + encodeURIComponent(c[f]));
            d += "?" + e.join("&")
        }
        var g = b.login.config.loginUrlParams;
        if (g) {
            var h = [];
            for (var i in g) h.push(i + "=" + encodeURIComponent(g[i]));
            d += /\?/.test(d) ? "&" + h.join("&") : "?" + e.join("&")
        }
        return d
    }

    function l(a, b) {
        b ? location.replace(a) : location.href = a
    }

    function m(b, c, d) {
        function e(b) {
            j.removeEventListener("close", e), a.removeEventListener("message", g), d("CANCEL")
        }

        function g(b) {
            var c = b.data || {};
            c && "child" === c.type && c.content.indexOf("SUCCESS") > -1 ? (j.removeEventListener("close", e), a.removeEventListener("message", g), j.hide(), d("SUCCESS")) : d("FAILURE")
        }

        var h = location.protocol + "//h5." + H.subDomain + ".taobao.com/" + ("waptest" === H.subDomain ? "src" : "other") + "/" + b + "end.html?origin=" + encodeURIComponent(location.protocol + "//" + location.hostname),
            i = k(b, {ttid: "h5@iframe", redirectURL: h}), j = new f(c.title || "您需要登录才能继续访问", i);
        j.addEventListener("close", e, !1), a.addEventListener("message", g, !1), j.show()
    }

    function n(b, c, d) {
        var e = k(b, {wvLoginCallback: "wvLoginCallback"});
        a.wvLoginCallback = function (b) {
            delete a.wvLoginCallback, d(b.indexOf(":SUCCESS") > -1 ? "SUCCESS" : b.indexOf(":CANCEL") > -1 ? "CANCEL" : "FAILURE")
        }, l(e)
    }

    function o(a, b, c) {
        if ("function" == typeof b ? (c = b, b = null) : "string" == typeof b && (b = {redirectUrl: b}), b = b || {}, c && A) n(a, b, c); else if (c && !z && "login" === a) m(a, b, c); else {
            var d = k(a, {redirectURL: b.redirectUrl || location.href});
            l(d, b.replace)
        }
    }

    function p(a, b, c) {
        var d;
        return u && (d = {}, d.promise = new u(function (a, b) {
            d.resolve = a, d.reject = b
        })), o(a, b, function (a) {
            c && c(a), "SUCCESS" === a ? d && d.resolve(a) : d && d.reject(a)
        }), d ? d.promise : void 0
    }

    function q(a) {
        o("login", a)
    }

    function r(a) {
        return p("login", a)
    }

    function s(a) {
        o("logout", a)
    }

    function t(a) {
        return p("logout", a)
    }

    var u = a.Promise, v = a.document, w = a.navigator.userAgent, x = location.hostname,
        y = (a.location.search, w.match(/WindVane[\/\s]([\d\.\_]+)/)), z = w.match(/AliApp\(([^\/]+)\/([\d\.\_]+)\)/i),
        A = !!(z && "TB" === z[1] && y && parseFloat(y[1]) > 5.2), B = ["taobao.net", "taobao.com"],
        C = new RegExp("([^.]*?)\\.?((?:" + B.join(")|(?:").replace(/\./g, "\\.") + "))", "i"), D = x.match(C) || [],
        E = function () {
            var a = D[2] || "taobao.com";
            return a.match(/\.?taobao\.net$/) ? "taobao.net" : "taobao.com"
        }(), F = function () {
            var a = E, b = D[1] || "m";
            return "taobao.net" === a && (b = "waptest"), ("m" != b || "wapa" != b || "waptest" != b) && (b = "m"), b
        }(), G = "login";
    b.login = b.login || {};
    var H = {loginName: "login.htm", logoutName: "logout.htm", subDomain: F};
    b.login.config = H, b.login.isLogin = g, b.login.isLoginAsync = h, b.login.getUserNick = i, b.login.getUserNickAsync = j, b.login.generateUrl = k, b.login.goLogin = q, b.login.goLoginAsync = r, b.login.goLogout = s, b.login.goLogoutAsync = t
}(window, window.lib || (window.lib = {}));
!function (a, b) {
    function c(a) {
        var b = {};
        Object.defineProperty(this, "params", {
            set: function (a) {
                if ("object" == typeof a) {
                    for (var c in b) delete b[c];
                    for (var c in a) b[c] = a[c]
                }
            }, get: function () {
                return b
            }, enumerable: !0
        }), Object.defineProperty(this, "search", {
            set: function (a) {
                if ("string" == typeof a) {
                    0 === a.indexOf("?") && (a = a.substr(1));
                    var c = a.split("&");
                    for (var d in b) delete b[d];
                    for (var e = 0; e < c.length; e++) {
                        var f = c[e].split("=");
                        if (f[0]) try {
                            b[decodeURIComponent(f[0])] = decodeURIComponent(f[1] || "")
                        } catch (g) {
                            b[f[0]] = f[1] || ""
                        }
                    }
                }
            }, get: function () {
                var a = [];
                for (var c in b) if (b[c]) try {
                    a.push(encodeURIComponent(c) + "=" + encodeURIComponent(b[c]))
                } catch (d) {
                    a.push(c + "=" + b[c])
                } else try {
                    a.push(encodeURIComponent(c))
                } catch (d) {
                    a.push(c)
                }
                return a.length ? "?" + a.join("&") : ""
            }, enumerable: !0
        });
        var c;
        Object.defineProperty(this, "hash", {
            set: function (a) {
                a && a.indexOf("#") < 0 && (a = "#" + a), c = a || ""
            }, get: function () {
                return c
            }, enumerable: !0
        }), this.set = function (a) {
            a = a || "";
            var b;
            if (!(b = a.match(new RegExp("^([a-z0-9-]+:)?[/]{2}(?:([^@/:?]+)(?::([^@/:]+))?@)?([^:/?#]+)(?:[:]([0-9]+))?([/][^?#;]*)?(?:[?]([^?#]*))?(#[^#]*)?$", "i")))) throw new Error("Wrong uri scheme.");
            this.protocol = b[1] || location.protocol, this.username = b[2] || "", this.password = b[3] || "", this.hostname = this.host = b[4], this.port = b[5] || "", this.pathname = b[6] || "/", this.search = b[7] || "", this.hash = b[8] || "", this.origin = this.protocol + "//" + this.hostname
        }, this.toString = function () {
            var a = this.protocol + "//";
            return this.username && (a += this.username, this.password && (a += ":" + this.password), a += "@"), a += this.host, this.port && "80" !== this.port && (a += ":" + this.port), this.pathname && (a += this.pathname), this.search && (a += this.search), this.hash && (a += this.hash), a
        }, a && this.set(a.toString())
    }

    b.httpurl = function (a) {
        return new c(a)
    }
}(window, window.lib || (window.lib = {}));
!function (a, b) {
    function c(a) {
        var b = null != navigator.userAgent.match(/WindVane/i);
        b && window.WindVane ? WindVane.call("WVNetwork", "getNetworkType", {}, function (b) {
            b && b.type && (A = b.type.toLowerCase()), a && a()
        }, function (b) {
            a && a()
        }) : a && a()
    }

    function d(a) {
        try {
            var b = new Image;
            b.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA", b.onload = function () {
                B = 2 === b.height ? !0 : !1, a && a()
            }, b.onerror = function () {
                B = !1, a && a()
            }
        } catch (c) {
            a && a()
        }
    }

    function e(a, b) {
        for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
        return a
    }

    function f(a, b) {
        if (a) {
            if (b || (b = {x: 0, y: 0}), a != window) var c = a.getBoundingClientRect(), d = c.left, e = c.top,
                f = c.right, g = c.bottom; else d = 0, e = 0, f = d + a.innerWidth, g = e + a.innerHeight;
            return {left: d, top: e, right: f + b.x, bottom: g + b.y}
        }
    }

    function g(a, b) {
        var c = C.dataSrc;
        if ("true" != a.getAttribute("data-src-checked")) {
            var d = a.getAttribute(c), e = a.getAttribute("data-size"), f = a.getAttribute("data-type"),
                g = a.getAttribute("data-cancel-exif"), h = {};
            e && (h.size = e), f && (h.type = f), a.attributes["data-original"] && (h.isOriginal = !0), null !== g && (h.cancelEXIF = "true" === g ? !0 : !1), d && (a.setAttribute(c, b.getNewUrl(d, h)), a.setAttribute("data-src-checked", "true"))
        }
    }

    function h(a, b) {
        function c(a) {
            if (a.removeAttribute(e), "IMG" === a.tagName) if (1 == a.getAttribute("data-cache")) {
                var b = i(h);
                a.setAttribute("src", b || h)
            } else a.setAttribute("src", h); else a.style.backgroundImage = "url(" + h + ")";
            a.className = a.className.replace(new RegExp("(^|\\s)" + C["class"] + "(\\s|$)"), "")
        }

        var d = a.target;
        g(d, b);
        var e = C.dataSrc, h = (f(window, {x: C.lazyWidth, y: C.lazyHeight}), d.getAttribute(e));
        f(d);
        h && c(d)
    }

    function i(a) {
        var b = !!window.localStorage, c = localStorage.getItem("h5_lib_img_cached_url_" + a);
        return b && c ? c : null
    }

    function j(a, b) {
        b = b || v;
        var c = z.square;
        if (!a || "string" != typeof a && "number" != typeof a) throw new Error("wrong size type");
        switch ("string" == typeof a && a.match(/^\d+x\d+$/) && (a = b == x ? a.split("x")[1] : a.split("x")[0]), b) {
            case w:
                c = z.widths;
                break;
            case x:
                c = z.heights;
                break;
            case y:
                c = z.xzs
        }
        var d = c[c.length - 1], e = c[0], f = 0, g = C.baseDpr;
        if (r || (a = parseInt(a / g)), a >= d) return d;
        if (e >= a) return e;
        for (var h = c.length; h >= 0; h--) if (c[h] <= a) {
            c[h] == a ? f = a : h < c.length - 1 && (f = c[h + 1]);
            break
        }
        return f
    }

    function k(a) {
        var b = "", c = "", d = C.q, e = C.sharpen, f = C.defaultSize, g = v, h = a.cancelEXIF;
        switch ("[object Array]" == Object.prototype.toString.call(d) && (d = d[0]), a && (a.size && (f = a.size), a.type && a.type.match(new RegExp("^(" + [v, w, x, y].join("|") + ")$")) && (g = a.type)), b = j(f, g), g) {
            case v:
                b = b + "x" + b;
                break;
            case w:
                b += "x10000";
                break;
            case x:
                b = "10000x" + b;
                break;
            case y:
                b = b + "x" + b + "xz"
        }
        return c = "_" + b, c += d + e, h && (c += "g"), c += ".jpg"
    }

    function l(a, c, d) {
        if (!b.appear) throw"运行需要依赖lib-appear组件，地址 -- //g.alicdn.cn/mtb/lib-appear/0.1.9/appear.js";
        d.appearInstance = b.appear.init({
            container: a, cls: c, onAppear: function (a) {
                h(a, d)
            }, onDisappear: function () {
                "wifi" == A && p && C.enalbeIOSWifiLoadMore && h(ev, d)
            }
        })
    }

    function m(a) {
        function b() {
            if ("[object Array]" == Object.prototype.toString.call(C.q)) if (r) C.q = A ? "wifi" == A ? C.q[0] : C.q[1] : C.q[0]; else {
                var a = parseInt(C.q[0].slice(1)), b = parseInt(C.q[1].slice(1)),
                    c = a + 40 >= 90 ? "q90" : "q" + (a + 40), e = b + 45 >= 75 ? "q75" : "q" + (b + 45);
                C.q = A ? "wifi" == A ? c : e : c
            }
            d(function () {
                l(f.container, g, f), f.appearInstance.fire()
            })
        }

        var f = this, g = a["class"] || C["class"];
        a = a || {}, delete a["class"], C = e(C, a), a.container || (a.container = window), this.container = a.container, a.filterDomains && a.filterDomains.length && (z.filterDomains = z.filterDomains.concat(a.filterDomains)), g = "." !== g.charAt(0) ? g : g.slice(1), C.size && (C.defaultSize = j(C.size)), c(b)
    }

    var n = (window.document, navigator.userAgent), o = window.devicePixelRatio ? window.devicePixelRatio : 1,
        p = null != n.match(/(iPhone\sOS)\s([\d_]+)/i), q = n.match(/(iPad)/), r = o >= 2;
    q && (r = !0);
    var s = "gw.alicdn.com",
        t = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==",
        u = /_(\d+x\d+|cy\d+i\d+|sum|m|b)?(xz|xc)?(q\d+)?(s\d+)?(\.jpg)?(_\.webp)?$/i, v = "square", w = "widthFixed",
        x = "heightFixed", y = "xz", z = {};
    z.widths = [110, 150, 170, 220, 240, 290, 450, 570, 580, 620, 790], z.heights = [170, 220, 340, 500], z.xzs = [72, 80, 88, 90, 100, 110, 120, 145, 160, 170, 180, 200, 230, 270, 290, 310, 360, 430, 460, 580, 640], z.square = [16, 20, 24, 30, 32, 36, 40, 48, 50, 60, 64, 70, 72, 80, 88, 90, 100, 110, 120, 125, 128, 145, 180, 190, 200, 200, 210, 220, 230, 240, 250, 270, 300, 310, 315, 320, 336, 360, 468, 490, 540, 560, 580, 600, 640, 720, 728, 760, 970], z.filterDomains = ["a.tbcdn.cn", "assets.alicdn.com", "wwc.taobaocdn.com", "wwc.alicdn.com", "cbu01.alicdn.com"];
    var A, B = !1, C = {
        "class": "lib-img",
        size: "320x320",
        sharpen: "s150",
        dataSrc: "data-src",
        q: ["q50", "q30"],
        enableLazyload: !0,
        lazyHeight: 0,
        lazyWidth: 0,
        enalbeIOSWifiLoadMore: !1,
        baseDpr: 2,
        diffGif: !1,
        cancelEXIF: !1,
        filterDomains: []
    }, D = [], E = new Function;
    E.prototype = {
        getNewUrl: function (a, c) {
            if (!a || "string" != typeof a) return "";
            var d = C.defaultSize + "x" + C.defaultSize, e = C.q, f = C.cancelEXIF;
            "[object Array]" == Object.prototype.toString.call(e) && (e = e[0]);
            var g = "_" + d + e + C.sharpen;
            f && (g += "g"), g += ".jpg";
            try {
                var h = new b.httpurl(a)
            } catch (i) {
                return console.log("[error]wrong img url:", a), a
            }
            var l = h.host, m = h.pathname;
            h.protocol;
            if (h.protocol = "", -1 != z.filterDomains.indexOf(l)) return /alicdn/.test(l) || (h.protocol = "http:"), h.toString();
            var n = l.match(/(.+\.(?:alicdn|taobaocdn|taobao|mmcdn)\.com)/);
            if (n && n[0] != s && (h.host = s), c && c.isOriginal) return h.toString();
            var o = m.match(u), p = m.match(/-(\d+)-(\d+)\.(?:jpg|png|gif)/);
            if (p) {
                var q, r;
                q = parseInt(p[1]) < parseInt(C.defaultSize) ? C.defaultSize : p[1] > 760 ? 760 : p[1], r = j(q), g = "_" + r + "x" + r + e + C.sharpen, f && (g += "g"), g += ".jpg"
            }
            return c && "string" == typeof c ? g = k({
                size: c,
                cancelEXIF: f
            }) : c && "object" == typeof c && Object.keys(c).length > 0 && (c.cancelEXIF = f, g = k(c)), /\.gif/.test(m) && C.diffGif ? h.toString() : (/\.png/.test(m) && (g = g.replace(/(q\d+)(s\d+)/, "")), B && (g += "_.webp"), o ? o[1] || o[2] || o[3] || o[4] ? h.pathname = m.replace(u, g) : o[0].match(/_\.(jpg|png|gif|jpef)/) && (h.pathname += g) : m.match(/_\.webp$/g) ? h.pathname = m.replace(/_\.webp$/g, g) : h.pathname = m + g, h.protocol = "", h.toString())
        }, fireLazyload: function () {
            this.appearInstance.fire()
        }
    }, b.img = function (a) {
        return imgHelper = new E, D.push(imgHelper), m.apply(imgHelper, arguments), imgHelper
    }, b.img.defaultSrc = t
}(window, window.lib || (window.lib = {}));
!function (a, b) {
    function c(a, b) {
        a = a.toString().split("."), b = b.toString().split(".");
        for (var c = 0; c < a.length || c < b.length; c++) {
            var d = parseInt(a[c], 10), e = parseInt(b[c], 10);
            if (window.isNaN(d) && (d = 0), window.isNaN(e) && (e = 0), d < e) return -1;
            if (d > e) return 1
        }
        return 0
    }

    var d = a.Promise, e = a.document, f = a.navigator.userAgent,
        g = /Windows\sPhone\s(?:OS\s)?[\d\.]+/i.test(f) || /Windows\sNT\s[\d\.]+/i.test(f),
        h = g && a.WindVane_Win_Private && a.WindVane_Win_Private.call, i = /iPhone|iPad|iPod/i.test(f),
        j = /Android/i.test(f), k = f.match(/WindVane[\/\s](\d+[._]\d+[._]\d+)/), l = Object.prototype.hasOwnProperty,
        m = b.windvane = a.WindVane || (a.WindVane = {}), n = (a.WindVane_Native, Math.floor(65536 * Math.random())),
        o = 1, p = [], q = 3, r = "hybrid", s = "wv_hybrid", t = "iframe_", u = "param_", v = "chunk_", w = 6e5,
        x = 6e5, y = 6e4;
    k = k ? (k[1] || "0.0.0").replace(/\_/g, ".") : "0.0.0";
    var z = {
        isAvailable: 1 === c(k, "0"), call: function (a, b, c, e, f, g) {
            var h, i;
            "number" == typeof arguments[arguments.length - 1] && (g = arguments[arguments.length - 1]), "function" != typeof e && (e = null), "function" != typeof f && (f = null), d && (i = {}, i.promise = new d(function (a, b) {
                i.resolve = a, i.reject = b
            })), h = A.getSid();
            var j = {success: e, failure: f, deferred: i};
            if (g > 0 && (j.timeout = setTimeout(function () {
                z.onFailure(h, {ret: "HY_TIMEOUT"})
            }, g)), A.registerCall(h, j), A.registerGC(h, g), z.isAvailable ? A.callMethod(a, b, c, h) : z.onFailure(h, {ret: "HY_NOT_IN_WINDVANE"}), i) return i.promise
        }, fireEvent: function (a, b, c) {
            var d = e.createEvent("HTMLEvents");
            d.initEvent(a, !1, !0), d.param = A.parseData(b || A.getData(c)), e.dispatchEvent(d)
        }, getParam: function (a) {
            return A.getParam(a)
        }, setData: function (a, b) {
            A.setData(a, b)
        }, onSuccess: function (a, b) {
            A.onComplete(a, b, "success")
        }, onFailure: function (a, b) {
            A.onComplete(a, b, "failure")
        }
    }, A = {
        params: {}, chunks: {}, calls: {}, getSid: function () {
            return (n + o++) % 65536 + ""
        }, buildParam: function (a) {
            return a && "object" == typeof a ? JSON.stringify(a) : a || ""
        }, getParam: function (a) {
            return this.params[u + a] || ""
        }, setParam: function (a, b) {
            this.params[u + a] = b
        }, parseData: function (a) {
            var b;
            if (a && "string" == typeof a) try {
                b = JSON.parse(a)
            } catch (a) {
                b = {ret: ["WV_ERR::PARAM_PARSE_ERROR"]}
            } else b = a || {};
            return b
        }, setData: function () {
            this.chunks[v + sid] = this.chunks[v + sid] || [], this.chunks[v + sid].push(chunk)
        }, getData: function (a) {
            return this.chunks[v + a] ? this.chunks[v + a].join("") : ""
        }, registerCall: function (a, b) {
            this.calls[a] = b
        }, unregisterCall: function (a) {
            var b = {};
            return this.calls[a] && (b = this.calls[a], delete this.calls[a]), b
        }, useIframe: function (a, b) {
            var c = t + a, d = p.pop();
            d || (d = e.createElement("iframe"), d.setAttribute("frameborder", "0"), d.style.cssText = "width:0;height:0;border:0;display:none;"), d.setAttribute("id", c), d.setAttribute("src", b), d.parentNode || setTimeout(function () {
                e.body.appendChild(d)
            }, 5)
        }, retrieveIframe: function (a) {
            var b = t + a, c = e.querySelector("#" + b);
            p.length >= q ? e.body.removeChild(c) : p.indexOf(c) < 0 && p.push(c)
        }, callMethod: function (b, c, d, e) {
            if (d = A.buildParam(d), g) h ? a.WindVane_Win_Private.call(b, c, e, d) : this.onComplete(e, {ret: "HY_NO_HANDLER_ON_WP"}, "failure"); else {
                var f = r + "://" + b + ":" + e + "/" + c + "?" + d;
                if (i) this.setParam(e, d), this.useIframe(e, f); else if (j) {
                    var k = s + ":";
                    window.prompt(f, k)
                } else this.onComplete(e, {ret: "HY_NOT_SUPPORT_DEVICE"}, "failure")
            }
        }, registerGC: function (a, b) {
            var c = this, d = Math.max(b || 0, w), e = Math.max(b || 0, y), f = Math.max(b || 0, x);
            setTimeout(function () {
                c.unregisterCall(a)
            }, d), i ? setTimeout(function () {
                c.params[u + a] && delete c.params[u + a]
            }, e) : j && setTimeout(function () {
                c.chunks[v + a] && delete c.chunks[v + a]
            }, f)
        }, onComplete: function (a, b, c) {
            var d = this.unregisterCall(a), e = d.success, f = d.failure, g = d.deferred, h = d.timeout;
            h && clearTimeout(h), b = b ? b : this.getData(a), b = this.parseData(b);
            var k = b.ret;
            "string" == typeof k && (b = b.value || b, b.ret || (b.ret = [k])), "success" === c ? (e && e(b), g && g.resolve(b)) : "failure" === c && (f && f(b), g && g.reject(b)), i ? (this.retrieveIframe(a), this.params[u + a] && delete this.params[u + a]) : j && this.chunks[v + a] && delete this.chunks[v + a]
        }
    };
    for (var B in z) l.call(m, B) || (m[B] = z[B])
}(window, window.lib || (window.lib = {}));