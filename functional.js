var λ = (function () {
    var λ = {}, hardReturn = "hardReturn;";

    var sliceArgs = function (args) {
        return args.length > 0 ? [].slice.call(args, 0) : [];
    };

    var checkFunction = function (func) {
        if (!func || typeof (func) !== "function") {
            throw "λ Error: Invalid function";
        }
    };

    λ.curry = function (func) {
        checkFunction(func);
        return function inner() {
            var _args = sliceArgs(arguments);
            if (_args.length === func.length) {
                return func.apply(null, _args);
            } else if (_args.length > func.length) {
                var initial = func.apply(null, _args);
                return λ.reduce(func, initial, _args.slice(func.length));
            } else {
                return function() {
                    var args = sliceArgs(arguments);
                    return inner.apply(null, _args.concat(args));
                };
            }
        };
    };

    λ.each = λ.curry(function (iterator, items) {
        checkFunction(iterator);
        for (var i = 0; i < items.length; i++) {
            if (iterator.call(null, items[i], i) === hardReturn) {
                return;
            }
        }
    });

    λ.map = λ.curry(function (iterator, items) {
        checkFunction(iterator);
        var mapped = [],
            mapEach;
        mapEach = λ.each(function () {
            mapped.push(iterator.apply(null, arguments));
        });
        mapEach(items);
        return mapped;
    });

    λ.reduce = λ.reducel = λ.curry(function (iterator, initial, items) {
        checkFunction(iterator);
        var cumulate = initial,
            reduceEach;
        reduceEach = λ.each(function (item) {
            cumulate = iterator.call(null, cumulate, item);
        });
        reduceEach(items);
        return cumulate;
    });

    λ.clone = function (items) {
        var clone = [];
        λ.each(function (item) {
            clone.push(item);
        }, items);
        return clone;
    };

    λ.first = λ.curry(function (iterator, items) {
        checkFunction(iterator);
        var first;
        λ.each(function (item) {
            if (iterator.call(null, item)) {
                first = item;
                return hardReturn;
            }
        }, items);
        return first;
    });

    λ.last = λ.curry(function (iterator, items) {
        var itemsClone = λ.clone(items);
        return λ.first(iterator, itemsClone.reverse());
    });

    λ.every = λ.all = λ.curry(function (iterator, items) {
        checkFunction(iterator);
        var isEvery = true;
        λ.each(function (item) {
            if (!iterator.call(null, item)) {
                isEvery = false;
            }
        }, items);
        return isEvery;
    });

    λ.any = λ.curry(function (iterator, items) {
        checkFunction(iterator);
        var isAny = false;
        λ.each(function (item) {
            if (iterator.call(null, item)) {
                isAny = true;
                return hardReturn;
            }
        }, items);
        return isAny;
    });

    λ.select = λ.curry(function (iterator, items) {
        checkFunction(iterator);
        var filtered = [],
            filterEach;
        filterEach = λ.each(function (item) {
            if (iterator.call(null, item)) {
                filtered.push(item);
            }
        });
        filterEach(items);
        return filtered;
    });

    λ.compose = function (funcs) {
        var hasInvalid = λ.any(function (func) {
            return typeof (func) !== "function";
        });
        funcs = sliceArgs(arguments);
        if (hasInvalid(funcs)) {
            throw "λ Error: Invalid function to compose";
        }
        return function() {
            var args = arguments;
            var applyEach = λ.each(function (func) {
                args = [func.apply(null, args)];
            });
            applyEach(funcs.reverse());
            return args[0];
        };
    };

    λ.partition = λ.curry(function (iterator, items) {
        checkFunction(iterator);
        var truthy = [], 
            falsy = [],
            partitionEach;
        partitionEach = λ.each(function (item) {
            (iterator.call(null, item) ? truthy : falsy).push(item);
        });
        partitionEach(items);
        return [truthy, falsy];
    });

    return λ;
})();

if (typeof (exports) !== "undefined") {
    if (typeof (module) !== "undefined" && module.exports) {
        exports = module.exports = λ;
    }
    exports.λ = λ;
}
