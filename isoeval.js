(function () {
    "use strict";

    if (typeof exports === 'object') {
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.default = isoeval;
    } else {
        (self || window || global || this)['isoeval'] = isoeval;
    }

    var _global = (new Function('return this'))();

    /**
     * Returns a function, which when called,
     * executes the provided code.
     * @param {string} code The JavaScript code to evaluate.
     * @param {string[]} args An array containing the names of the arguments of the resulting function.
     * @param {Object?} global The global object to use as a template.
     * @returns {Function} A function which when called executes the provided code.
     */
    function isoeval(args, code, global) {

        if (args === null) {
            args = [];
        }

        if (!(args instanceof Array)) {
            args = Array.prototype.slice.call(args);
        }

        global = global || _global;

        var proxyGlobal = createGlobal(global);

        var shadowNames = getAllPropertyNames(global)
            .filter(isValidVariableName);

        var codeToEval = [
            "(function(" + shadowNames.join(',') + ") { ",
                "return function() { ",
                    "with(arguments[0]) { ",
                        "return function(" + args.join(',') + ") { ",
                            "\"use strict\";",
                            "typeof __init === 'function' && __init.__isoevalInternal && __init();",
                            code,
                        "}",
                    "}",
                "}",
            "})"
        ].join('');

        var fn = (0, eval)(codeToEval)
            .call(null)
            .call(null, proxyGlobal);

        return function () {
            return fn.apply(this != null ? this : proxyGlobal, arguments);
        };
    }

    var ES2017_GLOBAL_PROP_NAMES = ['Infinity', 'NaN', 'undefined', 'eval', 'console', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'encodeURI', 'decodeURI', 'encodeURIComponent', 'decodeURIComponent', 'Array', 'ArrayBuffer', 'Boolean', 'DataView', 'Date', 'Error', 'EvalError', 'Float32Array', 'Float64Array', 'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Map', 'Number', 'Object', 'Proxy', 'Promise', 'RangeError', 'ReferenceError', 'RegExp', 'Set', 'String', 'Symbol', 'SyntaxError', 'TypeError', 'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'URIError', 'WeakMap', 'WeakSet', 'JSON', 'Math', 'Reflect', 'NativeError', 'setTimeout', 'setInterval', 'setImmediate'];

    function isES2017Global(key) {
        return ES2017_GLOBAL_PROP_NAMES.indexOf(key) !== -1;
    }

    var globalConstructorTag = {};

    function Global() {
        if (arguments[0] !== globalConstructorTag) {
            throw new TypeError('Illegal constructor');
        }

        var proxyGlobal = arguments[1];
        var keys = arguments[2];
        var self = this;

        var defineKey = (function (key) {
            if (key === 'self' || key === 'window' || key === 'global' || key === 'eval' || key === 'Function') {
                return;
            }
            var _value = proxyGlobal[key];
            var descriptor = Object.getOwnPropertyDescriptor(proxyGlobal, key);
            if (!descriptor) {
                Object.defineProperty(this, key, {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: void 0
                });
            } else if (descriptor.get || descriptor.set) {
                Object.defineProperty(this, key, {
                    configurable: descriptor.configurable,
                    enumerable: descriptor.enumerable,
                    get: function get() {
                        return _value;
                    },
                    set: function set(value) {
                        if (descriptor.writable) {
                            _value = value;
                        }
                    }
                });
            } else {
                Object.defineProperty(this, key, {
                    configurable: descriptor.configurable,
                    enumerable: descriptor.enumerable,
                    writable: descriptor.writable,
                    value: _value
                });
            }
        });

        for (var i = 0; i < keys.length; i++) {
            defineKey.call(this, keys[i]);
        }

        Object.defineProperty(this, 'self', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: this
        });

        Object.defineProperty(this, 'global', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: this
        });

        Object.defineProperty(this, 'eval', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function () {
                return isoeval(arguments[0])();
            }
        });

        var _Function = Function;
        var patchedFn = function () {
            var params = Array.prototype.slice.call(arguments, 1);
            var code = arguments[arguments.length - 1];
            return function () {
                var fn = isoeval('(function(' + params.join(',') + ') {' + code + '})', void 0, proxyGlobal);
                return fn().apply(this != null ? this : self, arguments);
            };
        };
        Object.defineProperty(this, 'Function', {
            configurable: true,
            enumerable: false,
            writable: true,
            value: patchedFn
        });
    }

    function createGlobal(global) {
        return new Global(globalConstructorTag, global, ES2017_GLOBAL_PROP_NAMES);
    }

    function createShadowObject(global, isValid) {
        var object = {};
        for (var key in global) {
            if (!isValid(key)) {
                (function (key) {
                    var isSet = false;
                    var _value = null;
                    Object.defineProperty(object, key, {
                        configurable: true,
                        writable: true,
                        enumerable: false,
                        value: void 0
                    });
                })(key);
            }
        }
        return object;
    }

    function getAllPropertyNames(obj) {
        var props = [];
        do {
            props = props.concat(Object.getOwnPropertyNames(obj));
        } while (obj = Object.getPrototypeOf(obj));
        return props;
    }

    function isValidVariableName(name) {
        try {
            new Function('var ' + name);
            return true;
        } catch (e) {
            return false;
        }
    }

}());