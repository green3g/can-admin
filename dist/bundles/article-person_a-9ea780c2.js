/*can-connect@1.5.5#connect*/
define('can-connect@1.5.5#connect', [
    'require',
    'exports',
    'module',
    'can-util/js/assign/assign'
], function (require, exports, module) {
    var assign = require('can-util/js/assign/assign');
    var connect = function (behaviors, options) {
        behaviors = behaviors.map(function (behavior, index) {
            var sortedIndex = -1;
            if (typeof behavior === 'string') {
                sortedIndex = connect.order.indexOf(behavior);
                behavior = behaviorsMap[behavior];
            } else if (behavior.isBehavior) {
                sortedIndex = connect.order.indexOf(behavior.behaviorName);
            } else {
                behavior = connect.behavior(behavior);
            }
            return {
                originalIndex: index,
                sortedIndex: sortedIndex,
                behavior: behavior
            };
        });
        behaviors.sort(function (b1, b2) {
            if (~b1.sortedIndex && ~b2.sortedIndex) {
                return b1.sortedIndex - b2.sortedIndex;
            }
            return b1.originalIndex - b2.originalIndex;
        });
        behaviors = behaviors.map(function (b) {
            return b.behavior;
        });
        var behavior = connect.base(connect.behavior('options', function () {
            return options;
        })());
        behaviors.forEach(function (behave) {
            behavior = behave(behavior);
        });
        if (behavior.init) {
            behavior.init();
        }
        return behavior;
    };
    connect.order = [
        'data/localstorage-cache',
        'data/url',
        'data/parse',
        'cache-requests',
        'data/combine-requests',
        'constructor',
        'constructor/store',
        'can/map',
        'can/ref',
        'fall-through-cache',
        'data/worker',
        'real-time',
        'data/callbacks-cache',
        'data/callbacks',
        'constructor/callbacks-once'
    ];
    connect.behavior = function (name, behavior) {
        if (typeof name !== 'string') {
            behavior = name;
            name = undefined;
        }
        var behaviorMixin = function (base) {
            var Behavior = function () {
            };
            Behavior.name = name;
            Behavior.prototype = base;
            var newBehavior = new Behavior();
            var res = typeof behavior === 'function' ? behavior.apply(newBehavior, arguments) : behavior;
            assign(newBehavior, res);
            newBehavior.__behaviorName = name;
            return newBehavior;
        };
        if (name) {
            behaviorMixin.behaviorName = name;
            behaviorsMap[name] = behaviorMixin;
        }
        behaviorMixin.isBehavior = true;
        return behaviorMixin;
    };
    var behaviorsMap = {};
    module.exports = connect;
});
/*can-connect@1.5.5#base/base*/
define('can-connect@1.5.5#base/base', [
    'require',
    'exports',
    'module',
    'can-connect/connect'
], function (require, exports, module) {
    var connect = require('can-connect/connect');
    module.exports = connect.behavior('base', function (baseConnection) {
        return {
            id: function (instance) {
                var ids = [], algebra = this.algebra;
                if (algebra && algebra.clauses && algebra.clauses.id) {
                    for (var prop in algebra.clauses.id) {
                        ids.push(instance[prop]);
                    }
                }
                if (this.idProp && !ids.length) {
                    ids.push(instance[this.idProp]);
                }
                if (!ids.length) {
                    ids.push(instance.id);
                }
                return ids.length > 1 ? ids.join('@|@') : ids[0];
            },
            idProp: baseConnection.idProp || 'id',
            listSet: function (list) {
                return list[this.listSetProp];
            },
            listSetProp: '__listSet',
            init: function () {
            }
        };
    });
});
/*can-connect@1.5.5#can-connect*/
define('can-connect@1.5.5#can-connect', [
    'require',
    'exports',
    'module',
    'can-connect/connect',
    'can-connect/base/base',
    'can-namespace'
], function (require, exports, module) {
    var connect = require('can-connect/connect');
    var base = require('can-connect/base/base');
    var ns = require('can-namespace');
    connect.base = base;
    module.exports = ns.connect = connect;
});
/*can-connect@1.5.5#helpers/weak-reference-map*/
define('can-connect@1.5.5#helpers/weak-reference-map', [
    'require',
    'exports',
    'module',
    'can-util/js/assign/assign'
], function (require, exports, module) {
    var assign = require('can-util/js/assign/assign');
    var WeakReferenceMap = function () {
        this.set = {};
    };
    assign(WeakReferenceMap.prototype, {
        has: function (key) {
            return !!this.set[key];
        },
        addReference: function (key, item, referenceCount) {
            if (typeof key === 'undefined') {
                throw new Error('can-connect: You must provide a key to store a value in a WeakReferenceMap');
            }
            var data = this.set[key];
            if (!data) {
                data = this.set[key] = {
                    item: item,
                    referenceCount: 0,
                    key: key
                };
            }
            data.referenceCount += referenceCount || 1;
        },
        referenceCount: function (key) {
            var data = this.set[key];
            if (data) {
                return data.referenceCount;
            }
        },
        deleteReference: function (key) {
            var data = this.set[key];
            if (data) {
                data.referenceCount--;
                if (data.referenceCount === 0) {
                    delete this.set[key];
                }
            }
        },
        get: function (key) {
            var data = this.set[key];
            if (data) {
                return data.item;
            }
        },
        forEach: function (cb) {
            for (var id in this.set) {
                cb(this.set[id].item, id);
            }
        }
    });
    module.exports = WeakReferenceMap;
});
/*can-connect@1.5.5#helpers/overwrite*/
define('can-connect@1.5.5#helpers/overwrite', function (require, exports, module) {
    module.exports = function (d, s, id) {
        for (var prop in d) {
            if (d.hasOwnProperty(prop) && !(prop.substr(0, 2) === '__') && prop !== id && !(prop in s)) {
                delete d[prop];
            }
        }
        for (prop in s) {
            d[prop] = s[prop];
        }
        return d;
    };
});
/*can-connect@1.5.5#helpers/id-merge*/
define('can-connect@1.5.5#helpers/id-merge', function (require, exports, module) {
    var map = [].map;
    module.exports = function (list, update, id, make) {
        var listIndex = 0, updateIndex = 0;
        while (listIndex < list.length && updateIndex < update.length) {
            var listItem = list[listIndex], updateItem = update[updateIndex], lID = id(listItem), uID = id(updateItem);
            if (id(listItem) === id(updateItem)) {
                listIndex++;
                updateIndex++;
                continue;
            }
            if (updateIndex + 1 < update.length && id(update[updateIndex + 1]) === lID) {
                list.splice(listIndex, 0, make(update[updateIndex]));
                listIndex++;
                updateIndex++;
                continue;
            } else if (listIndex + 1 < list.length && id(list[listIndex + 1]) === uID) {
                list.splice(listIndex, 1);
                listIndex++;
                updateIndex++;
                continue;
            } else {
                list.splice.apply(list, [
                    listIndex,
                    list.length - listIndex
                ].concat(map.call(update.slice(updateIndex), make)));
                return list;
            }
        }
        if (updateIndex === update.length && listIndex === list.length) {
            return;
        }
        list.splice.apply(list, [
            listIndex,
            list.length - listIndex
        ].concat(map.call(update.slice(updateIndex), make)));
        return;
    };
});
/*can-connect@1.5.5#constructor/constructor*/
define('can-connect@1.5.5#constructor/constructor', [
    'require',
    'exports',
    'module',
    'can-util/js/make-array/make-array',
    'can-util/js/assign/assign',
    'can-connect',
    'can-connect/helpers/weak-reference-map',
    'can-connect/helpers/overwrite',
    'can-connect/helpers/id-merge'
], function (require, exports, module) {
    var makeArray = require('can-util/js/make-array/make-array');
    var assign = require('can-util/js/assign/assign');
    var connect = require('can-connect');
    var WeakReferenceMap = require('can-connect/helpers/weak-reference-map');
    var overwrite = require('can-connect/helpers/overwrite');
    var idMerge = require('can-connect/helpers/id-merge');
    module.exports = connect.behavior('constructor', function (baseConnection) {
        var behavior = {
            cidStore: new WeakReferenceMap(),
            _cid: 0,
            get: function (params) {
                var self = this;
                return this.getData(params).then(function (data) {
                    return self.hydrateInstance(data);
                });
            },
            getList: function (set) {
                set = set || {};
                var self = this;
                return this.getListData(set).then(function (data) {
                    return self.hydrateList(data, set);
                });
            },
            hydrateList: function (listData, set) {
                if (Array.isArray(listData)) {
                    listData = { data: listData };
                }
                var arr = [];
                for (var i = 0; i < listData.data.length; i++) {
                    arr.push(this.hydrateInstance(listData.data[i]));
                }
                listData.data = arr;
                if (this.list) {
                    return this.list(listData, set);
                } else {
                    var list = listData.data.slice(0);
                    list[this.listSetProp || '__listSet'] = set;
                    copyMetadata(listData, list);
                    return list;
                }
            },
            hydrateInstance: function (props) {
                if (this.instance) {
                    return this.instance(props);
                } else {
                    return assign({}, props);
                }
            },
            save: function (instance) {
                var serialized = this.serializeInstance(instance);
                var id = this.id(instance);
                var self = this;
                if (id === undefined) {
                    var cid = this._cid++;
                    this.cidStore.addReference(cid, instance);
                    return this.createData(serialized, cid).then(function (data) {
                        if (data !== undefined) {
                            self.createdInstance(instance, data);
                        }
                        self.cidStore.deleteReference(cid, instance);
                        return instance;
                    });
                } else {
                    return this.updateData(serialized).then(function (data) {
                        if (data !== undefined) {
                            self.updatedInstance(instance, data);
                        }
                        return instance;
                    });
                }
            },
            destroy: function (instance) {
                var serialized = this.serializeInstance(instance), self = this;
                return this.destroyData(serialized).then(function (data) {
                    if (data !== undefined) {
                        self.destroyedInstance(instance, data);
                    }
                    return instance;
                });
            },
            createdInstance: function (instance, props) {
                assign(instance, props);
            },
            updatedInstance: function (instance, data) {
                overwrite(instance, data, this.idProp);
            },
            updatedList: function (list, listData, set) {
                var instanceList = [];
                for (var i = 0; i < listData.data.length; i++) {
                    instanceList.push(this.hydrateInstance(listData.data[i]));
                }
                idMerge(list, instanceList, this.id.bind(this), this.hydrateInstance.bind(this));
                copyMetadata(listData, list);
            },
            destroyedInstance: function (instance, data) {
                overwrite(instance, data, this.idProp);
            },
            serializeInstance: function (instance) {
                return assign({}, instance);
            },
            serializeList: function (list) {
                var self = this;
                return makeArray(list).map(function (instance) {
                    return self.serializeInstance(instance);
                });
            },
            isNew: function (instance) {
                var id = this.id(instance);
                return !(id || id === 0);
            }
        };
        return behavior;
    });
    function copyMetadata(listData, list) {
        for (var prop in listData) {
            if (prop !== 'data') {
                if (typeof list.set === 'function') {
                    list.set(prop, listData[prop]);
                } else if (typeof list.attr === 'function') {
                    list.attr(prop, listData[prop]);
                } else {
                    list[prop] = listData[prop];
                }
            }
        }
    }
});
/*can-validate-interface@0.1.0#index*/
define('can-validate-interface@0.1.0#index', function (require, exports, module) {
    function makeInterfaceValidator(interfacePropArrays) {
        var props = flatten(interfacePropArrays);
        return function (base) {
            var missingProps = props.reduce(function (missing, prop) {
                return prop in base ? missing : missing.concat(prop);
            }, []);
            return missingProps.length ? {
                message: 'missing expected properties',
                related: missingProps
            } : undefined;
        };
    }
    function flatten(arrays) {
        return arrays.reduce(function (ret, val) {
            return ret.concat(val);
        }, []);
    }
    module.exports = makeInterfaceValidator;
});
/*can-connect@1.5.5#helpers/validate*/
define('can-connect@1.5.5#helpers/validate', [
    'require',
    'exports',
    'module',
    'can-validate-interface'
], function (require, exports, module) {
    var makeInterfaceValidator = require('can-validate-interface');
    module.exports = function (extendingBehavior, interfaces) {
        var validatedBehaviour = validateArgumentInterface(extendingBehavior, 0, interfaces, function (errors, baseBehavior) {
            throw new BehaviorInterfaceError(baseBehavior, extendingBehavior, errors);
        });
        Object.keys(extendingBehavior).forEach(function (k) {
            validatedBehaviour[k] = extendingBehavior[k];
        });
        validatedBehaviour.__interfaces = interfaces;
        return validatedBehaviour;
    };
    function validateArgumentInterface(func, argIndex, interfaces, errorHandler) {
        return function () {
            var errors = makeInterfaceValidator(interfaces)(arguments[argIndex]);
            if (errors && errorHandler) {
                errorHandler(errors, arguments[argIndex]);
            }
            return func.apply(this, arguments);
        };
    }
    function BehaviorInterfaceError(baseBehavior, extendingBehavior, missingProps) {
        var extendingName = extendingBehavior.behaviorName || 'anonymous behavior', baseName = baseBehavior.__behaviorName || 'anonymous behavior', message = 'can-connect: Extending behavior "' + extendingName + '" found base behavior "' + baseName + '" was missing required properties: ' + JSON.stringify(missingProps.related), instance = new Error(message);
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
        }
        return instance;
    }
    BehaviorInterfaceError.prototype = Object.create(Error.prototype, { constructor: { value: Error } });
    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(BehaviorInterfaceError, Error);
    } else {
        BehaviorInterfaceError.__proto__ = Error;
    }
});
/*can-connect@1.5.5#can/map/map*/
define('can-connect@1.5.5#can/map/map', [
    'require',
    'exports',
    'module',
    'can-util/js/each/each',
    'can-connect',
    'can-event/batch/batch',
    'can-event',
    'can-observation',
    'can-util/js/is-plain-object/is-plain-object',
    'can-types',
    'can-util/js/each/each',
    'can-util/js/is-function/is-function',
    'can-util/js/dev/dev',
    'can-reflect'
], function (require, exports, module) {
    'use strict';
    var each = require('can-util/js/each/each');
    var connect = require('can-connect');
    var canBatch = require('can-event/batch/batch');
    var canEvent = require('can-event');
    var Observation = require('can-observation');
    var isPlainObject = require('can-util/js/is-plain-object/is-plain-object');
    var types = require('can-types');
    var each = require('can-util/js/each/each');
    var isFunction = require('can-util/js/is-function/is-function');
    var dev = require('can-util/js/dev/dev');
    var canReflect = require('can-reflect');
    var setExpando = function (map, prop, value) {
        if ('attr' in map) {
            map[prop] = value;
        } else {
            map._data[prop] = value;
        }
    };
    var getExpando = function (map, prop) {
        if ('attr' in map) {
            return map[prop];
        } else {
            return map._data[prop];
        }
    };
    var canMapBehavior = connect.behavior('can/map', function (baseConnection) {
        var behavior = {
            init: function () {
                this.Map = this.Map || types.DefaultMap.extend({});
                this.List = this.List || types.DefaultList.extend({});
                overwrite(this, this.Map, mapOverwrites, mapStaticOverwrites);
                overwrite(this, this.List, listPrototypeOverwrites, listStaticOverwrites);
                baseConnection.init.apply(this, arguments);
            },
            id: function (instance) {
                if (!isPlainObject(instance)) {
                    var ids = [], algebra = this.algebra;
                    if (algebra && algebra.clauses && algebra.clauses.id) {
                        for (var prop in algebra.clauses.id) {
                            ids.push(readObservable(instance, prop));
                        }
                    }
                    if (this.idProp && !ids.length) {
                        ids.push(readObservable(instance, this.idProp));
                    }
                    if (!ids.length) {
                        ids.push(readObservable(instance, 'id'));
                    }
                    return ids.length > 1 ? ids.join('@|@') : ids[0];
                } else {
                    return baseConnection.id(instance);
                }
            },
            serializeInstance: function (instance) {
                return instance.serialize();
            },
            serializeList: function (list) {
                return list.serialize();
            },
            instance: function (props) {
                var _Map = this.Map || types.DefaultMap;
                return new _Map(props);
            },
            list: function (listData, set) {
                var _List = this.List || this.Map && this.Map.List || types.DefaultList;
                var list = new _List(listData.data);
                each(listData, function (val, prop) {
                    if (prop !== 'data') {
                        list[list.set ? 'set' : 'attr'](prop, val);
                    }
                });
                list.__listSet = set;
                return list;
            },
            updatedList: function () {
                canBatch.start();
                var res = baseConnection.updatedList.apply(this, arguments);
                canBatch.stop();
                return res;
            },
            save: function (instance) {
                setExpando(instance, '_saving', true);
                canEvent.dispatch.call(instance, '_saving', [
                    true,
                    false
                ]);
                var done = function () {
                    setExpando(instance, '_saving', false);
                    canEvent.dispatch.call(instance, '_saving', [
                        false,
                        true
                    ]);
                };
                var base = baseConnection.save.apply(this, arguments);
                base.then(done, done);
                return base;
            },
            destroy: function (instance) {
                setExpando(instance, '_destroying', true);
                canEvent.dispatch.call(instance, '_destroying', [
                    true,
                    false
                ]);
                var done = function () {
                    setExpando(instance, '_destroying', false);
                    canEvent.dispatch.call(instance, '_destroying', [
                        false,
                        true
                    ]);
                };
                var base = baseConnection.destroy.apply(this, arguments);
                base.then(done, done);
                return base;
            }
        };
        each([
            'created',
            'updated',
            'destroyed'
        ], function (funcName) {
            behavior[funcName + 'Instance'] = function (instance, props) {
                if (props && typeof props === 'object') {
                    if (this.constructor.removeAttr) {
                        canReflect.updateDeep(instance, props);
                    } else {
                        canReflect.assignDeep(instance, props);
                    }
                }
                if (funcName === 'created' && this.moveCreatedInstanceToInstanceStore) {
                    this.moveCreatedInstanceToInstanceStore(instance);
                }
                canMapBehavior.callbackInstanceEvents(funcName, instance);
            };
        });
        return behavior;
    });
    canMapBehavior.callbackInstanceEvents = function (funcName, instance) {
        var constructor = instance.constructor;
        canEvent.dispatch.call(instance, {
            type: funcName,
            target: instance
        });
        canEvent.dispatch.call(constructor, funcName, [instance]);
    };
    var callCanReadingOnIdRead = true;
    var mapStaticOverwrites = {
        getList: function (base, connection) {
            return function (set) {
                return connection.getList(set);
            };
        },
        findAll: function (base, connection) {
            return function (set) {
                return connection.getList(set);
            };
        },
        get: function (base, connection) {
            return function (params) {
                return connection.get(params);
            };
        },
        findOne: function (base, connection) {
            return function (params) {
                return connection.get(params);
            };
        }
    };
    var mapOverwrites = {
        _eventSetup: function (base, connection) {
            return function () {
                callCanReadingOnIdRead = false;
                if (connection.addInstanceReference) {
                    connection.addInstanceReference(this);
                }
                callCanReadingOnIdRead = true;
                return base.apply(this, arguments);
            };
        },
        _eventTeardown: function (base, connection) {
            return function () {
                callCanReadingOnIdRead = false;
                if (connection.deleteInstanceReference) {
                    connection.deleteInstanceReference(this);
                }
                callCanReadingOnIdRead = true;
                return base.apply(this, arguments);
            };
        },
        ___set: function (base, connection) {
            return function (prop, val) {
                base.apply(this, arguments);
                if (prop === connection.idProp && this.__bindEvents && this.__bindEvents._lifecycleBindings) {
                    connection.addInstanceReference(this);
                }
            };
        },
        isNew: function (base, connection) {
            return function () {
                return connection.isNew(this);
            };
        },
        isSaving: function (base, connection) {
            return function () {
                Observation.add(this, '_saving');
                return !!getExpando(this, '_saving');
            };
        },
        isDestroying: function (base, connection) {
            return function () {
                Observation.add(this, '_destroying');
                return !!getExpando(this, '_destroying');
            };
        },
        save: function (base, connection) {
            return function (success, error) {
                var promise = connection.save(this);
                promise.then(success, error);
                return promise;
            };
        },
        destroy: function (base, connection) {
            return function (success, error) {
                var promise;
                if (this.isNew()) {
                    promise = Promise.resolve(this);
                    connection.destroyedInstance(this, {});
                } else {
                    promise = connection.destroy(this);
                }
                promise.then(success, error);
                return promise;
            };
        }
    };
    var listPrototypeOverwrites = {
        setup: function (base, connection) {
            return function (params) {
                if (isPlainObject(params) && !Array.isArray(params)) {
                    this.__listSet = params;
                    base.apply(this);
                    this.replace(canReflect.isPromise(params) ? params : connection.getList(params));
                } else {
                    base.apply(this, arguments);
                }
            };
        },
        _eventSetup: function (base, connection) {
            return function () {
                if (connection.addListReference) {
                    connection.addListReference(this);
                }
                if (base) {
                    return base.apply(this, arguments);
                }
            };
        },
        _eventTeardown: function (base, connection) {
            return function () {
                if (connection.deleteListReference) {
                    connection.deleteListReference(this);
                }
                if (base) {
                    return base.apply(this, arguments);
                }
            };
        }
    };
    var listStaticOverwrites = {
        _bubbleRule: function (base, connection) {
            return function (eventName, list) {
                var bubbleRules = base(eventName, list);
                bubbleRules.push('destroyed');
                return bubbleRules;
            };
        }
    };
    var readObservable = function (instance, prop) {
        if ('__get' in instance) {
            if (callCanReadingOnIdRead) {
                Observation.add(instance, prop);
            }
            return instance.__get(prop);
        } else {
            if (callCanReadingOnIdRead) {
                return instance[prop];
            } else {
                return Observation.ignore(function () {
                    return instance[prop];
                })();
            }
        }
    };
    var overwrite = function (connection, Constructor, prototype, statics) {
        var prop;
        for (prop in prototype) {
            Constructor.prototype[prop] = prototype[prop](Constructor.prototype[prop], connection);
        }
        if (statics) {
            for (prop in statics) {
                Constructor[prop] = statics[prop](Constructor[prop], connection);
            }
        }
    };
    module.exports = canMapBehavior;
});
/*can-connect@1.5.5#helpers/get-id-props*/
define('can-connect@1.5.5#helpers/get-id-props', function (require, exports, module) {
    module.exports = function (connection) {
        var ids = [], algebra = connection.algebra;
        if (algebra && algebra.clauses && algebra.clauses.id) {
            for (var prop in algebra.clauses.id) {
                ids.push(prop);
            }
        }
        if (connection.idProp && !ids.length) {
            ids.push(connection.idProp);
        }
        if (!ids.length) {
            ids.push('id');
        }
        return ids;
    };
});
/*can-connect@1.5.5#helpers/weak-reference-set*/
define('can-connect@1.5.5#helpers/weak-reference-set', [
    'require',
    'exports',
    'module',
    'can-util/js/assign/assign'
], function (require, exports, module) {
    var assign = require('can-util/js/assign/assign');
    var WeakReferenceSet = function () {
        this.set = [];
    };
    assign(WeakReferenceSet.prototype, {
        has: function (item) {
            return this._getIndex(item) !== -1;
        },
        addReference: function (item, referenceCount) {
            var index = this._getIndex(item);
            var data = this.set[index];
            if (!data) {
                data = {
                    item: item,
                    referenceCount: 0
                };
                this.set.push(data);
            }
            data.referenceCount += referenceCount || 1;
        },
        deleteReference: function (item) {
            var index = this._getIndex(item);
            var data = this.set[index];
            if (data) {
                data.referenceCount--;
                if (data.referenceCount === 0) {
                    this.set.splice(index, 1);
                }
            }
        },
        delete: function (item) {
            var index = this._getIndex(item);
            if (index !== -1) {
                this.set.splice(index, 1);
            }
        },
        get: function (item) {
            var data = this.set[this._getIndex(item)];
            if (data) {
                return data.item;
            }
        },
        referenceCount: function (item) {
            var data = this.set[this._getIndex(item)];
            if (data) {
                return data.referenceCount;
            }
        },
        _getIndex: function (item) {
            var index;
            this.set.every(function (data, i) {
                if (data.item === item) {
                    index = i;
                    return false;
                }
            });
            return index !== undefined ? index : -1;
        },
        forEach: function (cb) {
            return this.set.forEach(cb);
        }
    });
    module.exports = WeakReferenceSet;
});
/*can-connect@1.5.5#helpers/sorted-set-json*/
define('can-connect@1.5.5#helpers/sorted-set-json', function (require, exports, module) {
    var forEach = [].forEach;
    var keys = Object.keys;
    module.exports = function (set) {
        if (set == null) {
            return set;
        } else {
            var sorted = {};
            forEach.call(keys(set).sort(), function (prop) {
                sorted[prop] = set[prop];
            });
            return JSON.stringify(sorted);
        }
    };
});
/*can-connect@1.5.5#constructor/store/store*/
define('can-connect@1.5.5#constructor/store/store', [
    'require',
    'exports',
    'module',
    'can-connect',
    'can-connect/helpers/weak-reference-map',
    'can-connect/helpers/weak-reference-set',
    'can-connect/helpers/sorted-set-json',
    'can-event',
    'can-util/js/assign/assign'
], function (require, exports, module) {
    var connect = require('can-connect');
    var WeakReferenceMap = require('can-connect/helpers/weak-reference-map');
    var WeakReferenceSet = require('can-connect/helpers/weak-reference-set');
    var sortedSetJSON = require('can-connect/helpers/sorted-set-json');
    var canEvent = require('can-event');
    var assign = require('can-util/js/assign/assign');
    var pendingRequests = 0;
    var noRequestsTimer = null;
    var requests = {
        increment: function (connection) {
            pendingRequests++;
            clearTimeout(noRequestsTimer);
        },
        decrement: function (connection) {
            pendingRequests--;
            if (pendingRequests === 0) {
                noRequestsTimer = setTimeout(function () {
                    requests.dispatch('end');
                }, 10);
            }
        },
        count: function () {
            return pendingRequests;
        }
    };
    assign(requests, canEvent);
    var constructorStore = connect.behavior('constructor/store', function (baseConnection) {
        var behavior = {
            instanceStore: new WeakReferenceMap(),
            newInstanceStore: new WeakReferenceSet(),
            listStore: new WeakReferenceMap(),
            _requestInstances: {},
            _requestLists: {},
            _finishedRequest: function () {
                var id;
                requests.decrement(this);
                if (requests.count() === 0) {
                    for (id in this._requestInstances) {
                        this.instanceStore.deleteReference(id);
                    }
                    this._requestInstances = {};
                    for (id in this._requestLists) {
                        this.listStore.deleteReference(id);
                    }
                    this._requestLists = {};
                }
            },
            addInstanceReference: function (instance, id) {
                var ID = id || this.id(instance);
                if (ID === undefined) {
                    this.newInstanceStore.addReference(instance);
                } else {
                    this.instanceStore.addReference(ID, instance);
                }
            },
            createdInstance: function (instance, props) {
                baseConnection.createdInstance.apply(this, arguments);
                this.moveCreatedInstanceToInstanceStore(instance);
            },
            moveCreatedInstanceToInstanceStore: function (instance) {
                var ID = this.id(instance);
                if (this.newInstanceStore.has(instance) && ID !== undefined) {
                    var referenceCount = this.newInstanceStore.referenceCount(instance);
                    this.newInstanceStore.delete(instance);
                    this.instanceStore.addReference(ID, instance, referenceCount);
                }
            },
            addInstanceMetaData: function (instance, name, value) {
                var data = this.instanceStore.set[this.id(instance)];
                if (data) {
                    data[name] = value;
                }
            },
            getInstanceMetaData: function (instance, name) {
                var data = this.instanceStore.set[this.id(instance)];
                if (data) {
                    return data[name];
                }
            },
            deleteInstanceMetaData: function (instance, name) {
                var data = this.instanceStore.set[this.id(instance)];
                delete data[name];
            },
            deleteInstanceReference: function (instance) {
                var ID = this.id(instance);
                if (ID === undefined) {
                    this.newInstanceStore.deleteReference(instance);
                } else {
                    this.instanceStore.deleteReference(this.id(instance), instance);
                }
            },
            addListReference: function (list, set) {
                var id = sortedSetJSON(set || this.listSet(list));
                if (id) {
                    this.listStore.addReference(id, list);
                }
            },
            deleteListReference: function (list, set) {
                var id = sortedSetJSON(set || this.listSet(list));
                if (id) {
                    this.listStore.deleteReference(id, list);
                }
            },
            hydratedInstance: function (instance) {
                if (requests.count() > 0) {
                    var id = this.id(instance);
                    if (!this._requestInstances[id]) {
                        this.addInstanceReference(instance);
                        this._requestInstances[id] = instance;
                    }
                }
            },
            hydrateInstance: function (props) {
                var id = this.id(props);
                if ((id || id === 0) && this.instanceStore.has(id)) {
                    var storeInstance = this.instanceStore.get(id);
                    this.updatedInstance(storeInstance, props);
                    return storeInstance;
                }
                var instance = baseConnection.hydrateInstance.call(this, props);
                this.hydratedInstance(instance);
                return instance;
            },
            hydratedList: function (list, set) {
                if (requests.count() > 0) {
                    var id = sortedSetJSON(set || this.listSet(list));
                    if (id) {
                        if (!this._requestLists[id]) {
                            this.addListReference(list, set);
                            this._requestLists[id] = list;
                        }
                    }
                }
            },
            hydrateList: function (listData, set) {
                set = set || this.listSet(listData);
                var id = sortedSetJSON(set);
                if (id && this.listStore.has(id)) {
                    var storeList = this.listStore.get(id);
                    this.updatedList(storeList, listData, set);
                    return storeList;
                }
                var list = baseConnection.hydrateList.call(this, listData, set);
                this.hydratedList(list, set);
                return list;
            },
            getList: function (listSet) {
                var self = this;
                requests.increment(this);
                var promise = baseConnection.getList.call(this, listSet);
                promise.then(function (instances) {
                    self._finishedRequest();
                }, function () {
                    self._finishedRequest();
                });
                return promise;
            },
            get: function (params) {
                var self = this;
                requests.increment(this);
                var promise = baseConnection.get.call(this, params);
                promise.then(function (instance) {
                    self._finishedRequest();
                }, function () {
                    self._finishedRequest();
                });
                return promise;
            },
            save: function (instance) {
                var self = this;
                requests.increment(this);
                var updating = !this.isNew(instance);
                if (updating) {
                    this.addInstanceReference(instance);
                }
                var promise = baseConnection.save.call(this, instance);
                promise.then(function (instances) {
                    if (updating) {
                        self.deleteInstanceReference(instance);
                    }
                    self._finishedRequest();
                }, function () {
                    self._finishedRequest();
                });
                return promise;
            },
            destroy: function (instance) {
                var self = this;
                requests.increment(this);
                var promise = baseConnection.destroy.call(this, instance);
                promise.then(function (instance) {
                    self._finishedRequest();
                }, function () {
                    self._finishedRequest();
                });
                return promise;
            }
        };
        return behavior;
    });
    constructorStore.requests = requests;
    module.exports = constructorStore;
});
/*can-connect@1.5.5#can/ref/ref*/
define('can-connect@1.5.5#can/ref/ref', [
    'require',
    'exports',
    'module',
    'can-connect',
    'can-connect/helpers/get-id-props',
    'can-connect/helpers/weak-reference-map',
    'can-observation',
    'can-connect/constructor/store/store',
    'can-define'
], function (require, exports, module) {
    var connect = require('can-connect');
    var getIdProps = require('can-connect/helpers/get-id-props');
    var WeakReferenceMap = require('can-connect/helpers/weak-reference-map');
    var Observation = require('can-observation');
    var constructorStore = require('can-connect/constructor/store/store');
    var define = require('can-define');
    var makeRef = function (connection) {
        var idProp = getIdProps(connection)[0];
        var Ref = function (id, value) {
            if (typeof id === 'object') {
                value = id;
                id = value[idProp];
            }
            var storeRef = Ref.store.get(id);
            if (storeRef) {
                if (value && !storeRef._value) {
                    if (value instanceof connection.Map) {
                        storeRef._value = value;
                    } else {
                        storeRef._value = connection.hydrateInstance(value);
                    }
                }
                return storeRef;
            }
            this[idProp] = id;
            if (value) {
                if (value instanceof connection.Map) {
                    this._value = value;
                } else {
                    this._value = connection.hydrateInstance(value);
                }
            }
            if (constructorStore.requests.count() > 0) {
                if (!Ref._requestInstances[id]) {
                    Ref.store.addReference(id, this);
                    Ref._requestInstances[id] = this;
                }
            }
        };
        Ref.store = new WeakReferenceMap();
        Ref._requestInstances = {};
        Ref.type = function (ref) {
            if (ref && typeof ref !== 'object') {
                return new Ref(ref);
            } else {
                return new Ref(ref[idProp], ref);
            }
        };
        var defs = {
            promise: {
                get: function () {
                    if (this._value) {
                        return Promise.resolve(this._value);
                    } else {
                        var props = {};
                        props[idProp] = this[idProp];
                        return connection.Map.get(props);
                    }
                }
            },
            _state: {
                get: function (lastSet, resolve) {
                    if (resolve) {
                        this.promise.then(function () {
                            resolve('resolved');
                        }, function () {
                            resolve('rejected');
                        });
                    }
                    return 'pending';
                }
            },
            value: {
                get: function (lastSet, resolve) {
                    if (this._value) {
                        return this._value;
                    } else if (resolve) {
                        this.promise.then(function (value) {
                            resolve(value);
                        });
                    }
                }
            },
            reason: {
                get: function (lastSet, resolve) {
                    if (this._value) {
                        return undefined;
                    } else {
                        this.promise.catch(function (value) {
                            resolve(value);
                        });
                    }
                }
            }
        };
        defs[idProp] = {
            type: '*',
            set: function () {
                this._value = undefined;
            }
        };
        define(Ref.prototype, defs);
        Ref.prototype.unobservedId = Observation.ignore(function () {
            return this[idProp];
        });
        Ref.prototype.isResolved = function () {
            return !!this._value || this._state === 'resolved';
        };
        Ref.prototype.isRejected = function () {
            return this._state === 'rejected';
        };
        Ref.prototype.isPending = function () {
            return !this._value && (this._state !== 'resolved' || this._state !== 'rejected');
        };
        Ref.prototype.serialize = function () {
            return this[idProp];
        };
        var baseEventSetup = Ref.prototype._eventSetup;
        Ref.prototype._eventSetup = function () {
            Ref.store.addReference(this.unobservedId(), this);
            return baseEventSetup.apply(this, arguments);
        };
        var baseTeardown = Ref.prototype._eventTeardown;
        Ref.prototype._eventTeardown = function () {
            Ref.store.deleteReference(this.unobservedId(), this);
            return baseTeardown.apply(this, arguments);
        };
        constructorStore.requests.on('end', function () {
            for (var id in Ref._requestInstances) {
                Ref.store.deleteReference(id);
            }
            Ref._requestInstances = {};
        });
        return Ref;
    };
    module.exports = connect.behavior('can/ref', function (baseConnection) {
        return {
            init: function () {
                baseConnection.init.apply(this, arguments);
                this.Map.Ref = makeRef(this);
            }
        };
    });
});
/*can-connect@1.5.5#data/callbacks/callbacks*/
define('can-connect@1.5.5#data/callbacks/callbacks', [
    'require',
    'exports',
    'module',
    'can-connect',
    'can-util/js/each/each'
], function (require, exports, module) {
    var connect = require('can-connect');
    var each = require('can-util/js/each/each');
    var pairs = {
        getListData: 'gotListData',
        createData: 'createdData',
        updateData: 'updatedData',
        destroyData: 'destroyedData'
    };
    var dataCallbackBehavior = connect.behavior('data/callbacks', function (baseConnection) {
        var behavior = {};
        each(pairs, function (callbackName, name) {
            behavior[name] = function (params, cid) {
                var self = this;
                return baseConnection[name].call(this, params).then(function (data) {
                    if (self[callbackName]) {
                        return self[callbackName].call(self, data, params, cid);
                    } else {
                        return data;
                    }
                });
            };
        });
        return behavior;
    });
    module.exports = dataCallbackBehavior;
});
/*can-connect@1.5.5#data/parse/parse*/
define('can-connect@1.5.5#data/parse/parse', [
    'require',
    'exports',
    'module',
    'can-connect',
    'can-util/js/each/each',
    'can-util/js/get/get'
], function (require, exports, module) {
    var connect = require('can-connect');
    var each = require('can-util/js/each/each');
    var getObject = require('can-util/js/get/get');
    module.exports = connect.behavior('data/parse', function (baseConnection) {
        var behavior = {
            parseListData: function (responseData) {
                if (baseConnection.parseListData) {
                    responseData = baseConnection.parseListData.apply(this, arguments);
                }
                var result;
                if (Array.isArray(responseData)) {
                    result = { data: responseData };
                } else {
                    var prop = this.parseListProp || 'data';
                    responseData.data = getObject(responseData, prop);
                    result = responseData;
                    if (prop !== 'data') {
                        delete responseData[prop];
                    }
                    if (!Array.isArray(result.data)) {
                        throw new Error('Could not get any raw data while converting using .parseListData');
                    }
                }
                var arr = [];
                for (var i = 0; i < result.data.length; i++) {
                    arr.push(this.parseInstanceData(result.data[i]));
                }
                result.data = arr;
                return result;
            },
            parseInstanceData: function (props) {
                if (baseConnection.parseInstanceData) {
                    props = baseConnection.parseInstanceData.apply(this, arguments) || props;
                }
                return this.parseInstanceProp ? getObject(props, this.parseInstanceProp) || props : props;
            }
        };
        each(pairs, function (parseFunction, name) {
            behavior[name] = function (params) {
                var self = this;
                return baseConnection[name].call(this, params).then(function () {
                    return self[parseFunction].apply(self, arguments);
                });
            };
        });
        return behavior;
    });
    var pairs = {
        getListData: 'parseListData',
        getData: 'parseInstanceData',
        createData: 'parseInstanceData',
        updateData: 'parseInstanceData',
        destroyData: 'parseInstanceData'
    };
});
/*can-set@1.3.2#src/helpers*/
define('can-set@1.3.2#src/helpers', [
    'require',
    'exports',
    'module',
    'can-util/js/assign/assign',
    'can-util/js/each/each',
    'can-util/js/last/last'
], function (require, exports, module) {
    var assign = require('can-util/js/assign/assign');
    var each = require('can-util/js/each/each');
    var last = require('can-util/js/last/last');
    var IgnoreType = function () {
    };
    var helpers;
    module.exports = helpers = {
        eachInUnique: function (a, acb, b, bcb, defaultReturn) {
            var bCopy = assign({}, b), res;
            for (var prop in a) {
                res = acb(a[prop], b[prop], a, b, prop);
                if (res !== undefined) {
                    return res;
                }
                delete bCopy[prop];
            }
            for (prop in bCopy) {
                res = bcb(undefined, b[prop], a, b, prop);
                if (res !== undefined) {
                    return res;
                }
            }
            return defaultReturn;
        },
        doubleLoop: function (arr, callbacks) {
            if (typeof callbacks === 'function') {
                callbacks = { iterate: callbacks };
            }
            var i = 0;
            while (i < arr.length) {
                if (callbacks.start) {
                    callbacks.start(arr[i]);
                }
                var j = i + 1;
                while (j < arr.length) {
                    if (callbacks.iterate(arr[j], j, arr[i], i) === false) {
                        arr.splice(j, 1);
                    } else {
                        j++;
                    }
                }
                if (callbacks.end) {
                    callbacks.end(arr[i]);
                }
                i++;
            }
        },
        identityMap: function (arr) {
            var map = {};
            each(arr, function (value) {
                map[value] = 1;
            });
            return map;
        },
        arrayUnionIntersectionDifference: function (arr1, arr2) {
            var map = {};
            var intersection = [];
            var union = [];
            var difference = arr1.slice(0);
            each(arr1, function (value) {
                map[value] = true;
                union.push(value);
            });
            each(arr2, function (value) {
                if (map[value]) {
                    intersection.push(value);
                    var index = helpers.indexOf.call(difference, value);
                    if (index !== -1) {
                        difference.splice(index, 1);
                    }
                } else {
                    union.push(value);
                }
            });
            return {
                intersection: intersection,
                union: union,
                difference: difference
            };
        },
        arraySame: function (arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return false;
            }
            var map = helpers.identityMap(arr1);
            for (var i = 0; i < arr2.length; i++) {
                var val = map[arr2[i]];
                if (!val) {
                    return false;
                } else if (val > 1) {
                    return false;
                } else {
                    map[arr2[i]]++;
                }
            }
            return true;
        },
        indexOf: Array.prototype.indexOf || function (item) {
            for (var i = 0, thisLen = this.length; i < thisLen; i++) {
                if (this[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        map: Array.prototype.map || function (cb) {
            var out = [];
            for (var i = 0, len = this.length; i < len; i++) {
                out.push(cb(this[i], i, this));
            }
            return out;
        },
        filter: Array.prototype.filter || function (cb) {
            var out = [];
            for (var i = 0, len = this.length; i < len; i++) {
                if (cb(this[i], i, this)) {
                    out.push(this[i]);
                }
            }
            return out;
        },
        ignoreType: new IgnoreType(),
        firstProp: function (set) {
            for (var prop in set) {
                return prop;
            }
        },
        index: function (compare, items, props) {
            if (!items || !items.length) {
                return undefined;
            }
            if (compare(props, items[0]) === -1) {
                return 0;
            } else if (compare(props, last(items)) === 1) {
                return items.length;
            }
            var low = 0, high = items.length;
            while (low < high) {
                var mid = low + high >>> 1, item = items[mid], computed = compare(props, item);
                if (computed === -1) {
                    high = mid;
                } else {
                    low = mid + 1;
                }
            }
            return high;
        },
        defaultSort: function (sortPropValue, item1, item2) {
            var parts = sortPropValue.split(' ');
            var sortProp = parts[0];
            var item1Value = item1[sortProp];
            var item2Value = item2[sortProp];
            var temp;
            var desc = parts[1] || '';
            desc = desc.toLowerCase() === 'desc';
            if (desc) {
                temp = item1Value;
                item1Value = item2Value;
                item2Value = temp;
            }
            if (item1Value < item2Value) {
                return -1;
            }
            if (item1Value > item2Value) {
                return 1;
            }
            return 0;
        }
    };
});
/*can-set@1.3.2#src/clause*/
define('can-set@1.3.2#src/clause', [
    'require',
    'exports',
    'module',
    'can-util/js/assign/assign',
    'can-util/js/each/each'
], function (require, exports, module) {
    var assign = require('can-util/js/assign/assign');
    var each = require('can-util/js/each/each');
    var clause = {};
    module.exports = clause;
    clause.TYPES = [
        'where',
        'order',
        'paginate',
        'id'
    ];
    each(clause.TYPES, function (type) {
        var className = type.charAt(0).toUpperCase() + type.substr(1);
        clause[className] = function (compare) {
            assign(this, compare);
        };
        clause[className].type = type;
    });
});
/*can-set@1.3.2#src/compare*/
define('can-set@1.3.2#src/compare', [
    'require',
    'exports',
    'module',
    './helpers',
    'can-util/js/assign/assign',
    'can-util/js/each/each',
    'can-util/js/make-array/make-array'
], function (require, exports, module) {
    var h = require('./helpers');
    var assign = require('can-util/js/assign/assign');
    var each = require('can-util/js/each/each');
    var makeArray = require('can-util/js/make-array/make-array');
    var compareHelpers;
    var loop = function (a, b, aParent, bParent, prop, compares, options) {
        var checks = options.checks;
        for (var i = 0; i < checks.length; i++) {
            var res = checks[i](a, b, aParent, bParent, prop, compares || {}, options);
            if (res !== undefined) {
                return res;
            }
        }
        return options['default'];
    };
    var addIntersectedPropertyToResult = function (a, b, aParent, bParent, prop, compares, options) {
        var subsetCheck;
        if (!(prop in aParent)) {
            subsetCheck = 'subsetB';
        } else if (prop in bParent) {
            return false;
        }
        if (!(prop in bParent)) {
            subsetCheck = 'subsetA';
        }
        if (subsetCheck === 'subsetB') {
            options.result[prop] = b;
        } else {
            options.result[prop] = a;
        }
        return undefined;
    };
    var addToResult = function (fn, name) {
        return function (a, b, aParent, bParent, prop, compares, options) {
            var res = fn.apply(this, arguments);
            if (res === true) {
                if (prop !== undefined && !(prop in options.result)) {
                    options.result[prop] = a;
                }
                return true;
            } else {
                return res;
            }
        };
    };
    module.exports = compareHelpers = {
        equal: function (a, b, aParent, bParent, prop, compares, options) {
            options.checks = [
                compareHelpers.equalComparesType,
                compareHelpers.equalBasicTypes,
                compareHelpers.equalArrayLike,
                compareHelpers.equalObject
            ];
            options['default'] = false;
            return loop(a, b, aParent, bParent, prop, compares, options);
        },
        equalComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    return compareResult;
                } else if (compareResult && typeof compareResult === 'object') {
                    if ('intersection' in compareResult && !('difference' in compareResult)) {
                        var reverseResult = compares(b, a, bParent, aParent, prop, options);
                        return 'intersection' in reverseResult && !('difference' in reverseResult);
                    }
                    return false;
                }
                return compareResult;
            }
        },
        equalBasicTypes: function (a, b, aParent, bParent, prop, compares, options) {
            if (a === null || b === null) {
                return a === b;
            }
            if (a instanceof Date && b instanceof Date) {
                return a.getTime() === b.getTime();
            }
            if (options.deep === -1) {
                return typeof a === 'object' || a === b;
            }
            if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
                return false;
            }
            if (a === b) {
                return true;
            }
        },
        equalArrayLike: function (a, b, aParent, bParent, prop, compares, options) {
            if (Array.isArray(a) && Array.isArray(b)) {
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; i++) {
                    var compare = compares[i] === undefined ? compares['*'] : compares[i];
                    if (!loop(a[i], b[i], a, b, i, compare, options)) {
                        return false;
                    }
                }
                return true;
            }
        },
        equalObject: function (a, b, aParent, bParent, parentProp, compares, options) {
            var aType = typeof a;
            if (aType === 'object' || aType === 'function') {
                var bCopy = assign({}, b);
                if (options.deep === false) {
                    options.deep = -1;
                }
                for (var prop in a) {
                    var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                    if (!loop(a[prop], b[prop], a, b, prop, compare, options)) {
                        return false;
                    }
                    delete bCopy[prop];
                }
                for (prop in bCopy) {
                    if (compares[prop] === undefined || !loop(undefined, b[prop], a, b, prop, compares[prop], options)) {
                        return false;
                    }
                }
                return true;
            }
        },
        subset: function (a, b, aParent, bParent, prop, compares, options) {
            options.checks = [
                compareHelpers.subsetComparesType,
                compareHelpers.equalBasicTypes,
                compareHelpers.equalArrayLike,
                compareHelpers.subsetObject
            ];
            options.getSubsets = [];
            options['default'] = false;
            return loop(a, b, aParent, bParent, prop, compares, options);
        },
        subsetObject: function (a, b, aParent, bParent, parentProp, compares, options) {
            var aType = typeof a;
            if (aType === 'object' || aType === 'function') {
                return h.eachInUnique(a, function (a, b, aParent, bParent, prop) {
                    var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                    if (!loop(a, b, aParent, bParent, prop, compare, options) && prop in bParent) {
                        return false;
                    }
                }, b, function (a, b, aParent, bParent, prop) {
                    var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                    if (!loop(a, b, aParent, bParent, prop, compare, options)) {
                        return false;
                    }
                }, true);
            }
        },
        subsetComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    return compareResult;
                } else if (compareResult && typeof compareResult === 'object') {
                    if (compareResult.getSubset) {
                        if (h.indexOf.call(options.getSubsets, compareResult.getSubset) === -1) {
                            options.getSubsets.push(compareResult.getSubset);
                        }
                    }
                    if (compareResult.intersection === h.ignoreType || compareResult.difference === h.ignoreType) {
                        return true;
                    }
                    if ('intersection' in compareResult && !('difference' in compareResult)) {
                        var reverseResult = compares(b, a, bParent, aParent, prop, options);
                        return 'intersection' in reverseResult;
                    }
                    return false;
                }
                return compareResult;
            }
        },
        properSupersetObject: function (a, b, aParent, bParent, parentProp, compares, options) {
            var bType = typeof b;
            var hasAdditionalProp = false;
            if (bType === 'object' || bType === 'function') {
                var aCopy = assign({}, a);
                if (options.deep === false) {
                    options.deep = -1;
                }
                for (var prop in b) {
                    var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                    var compareResult = loop(a[prop], b[prop], a, b, prop, compare, options);
                    if (compareResult === h.ignoreType) {
                    } else if (!(prop in a) || options.performedDifference) {
                        hasAdditionalProp = true;
                    } else if (!compareResult) {
                        return false;
                    }
                    delete aCopy[prop];
                }
                for (prop in aCopy) {
                    if (compares[prop] === undefined || !loop(a[prop], undefined, a, b, prop, compares[prop], options)) {
                        return false;
                    }
                }
                return hasAdditionalProp;
            }
        },
        properSubsetComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    return compareResult;
                } else if (compareResult && typeof compareResult === 'object') {
                    if ('intersection' in compareResult && !('difference' in compareResult)) {
                        var reverseResult = compares(b, a, bParent, aParent, prop, options);
                        return 'intersection' in reverseResult && 'difference' in reverseResult;
                    }
                    return false;
                }
                return compareResult;
            }
        },
        difference: function (a, b, aParent, bParent, prop, compares, options) {
            options.result = {};
            options.performedDifference = 0;
            options.checks = [
                compareHelpers.differenceComparesType,
                addToResult(compareHelpers.equalBasicTypes, 'equalBasicTypes'),
                addToResult(compareHelpers.equalArrayLike, 'equalArrayLike'),
                addToResult(compareHelpers.properSupersetObject, 'properSubsetObject')
            ];
            options['default'] = true;
            var res = loop(a, b, aParent, bParent, prop, compares, options);
            if (res === true && options.performedDifference) {
                return options.result;
            }
            return res;
        },
        differenceComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    if (compareResult === true) {
                        options.result[prop] = a;
                        return true;
                    } else {
                        return compareResult;
                    }
                } else if (compareResult && typeof compareResult === 'object') {
                    if ('difference' in compareResult) {
                        if (compareResult.difference === h.ignoreType) {
                            return h.ignoreType;
                        } else if (compareResult.difference != null) {
                            options.result[prop] = compareResult.difference;
                            options.performedDifference++;
                            return true;
                        } else {
                            return true;
                        }
                    } else {
                        if (compareHelpers.equalComparesType.apply(this, arguments)) {
                            options.performedDifference++;
                            options.result[prop] = compareResult.union;
                        } else {
                            return false;
                        }
                    }
                }
            }
        },
        union: function (a, b, aParent, bParent, prop, compares, options) {
            options.result = {};
            options.performedUnion = 0;
            options.checks = [
                compareHelpers.unionComparesType,
                addToResult(compareHelpers.equalBasicTypes, 'equalBasicTypes'),
                addToResult(compareHelpers.unionArrayLike, 'unionArrayLike'),
                addToResult(compareHelpers.unionObject, 'unionObject')
            ];
            options.getUnions = [];
            options['default'] = false;
            var res = loop(a, b, aParent, bParent, prop, compares, options);
            if (res === true) {
                return options.result;
            }
            return false;
        },
        unionComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    if (compareResult === true) {
                        options.result[prop] = a;
                        return true;
                    } else {
                        return compareResult;
                    }
                } else if (compareResult && typeof compareResult === 'object') {
                    if (compareResult.getUnion) {
                        if (h.indexOf.call(options.getUnions, compareResult.getUnion) === -1) {
                            options.getUnions.push(compareResult.getUnion);
                        }
                    }
                    if ('union' in compareResult) {
                        if (compareResult.union === h.ignoreType) {
                            return compareResult.union;
                        }
                        if (compareResult.union !== undefined) {
                            options.result[prop] = compareResult.union;
                        }
                        options.performedUnion++;
                        return true;
                    }
                }
            }
        },
        unionObject: function (a, b, aParent, bParent, prop, compares, options) {
            var subsetCompare = function (a, b, aParent, bParent, prop) {
                var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                if (!loop(a, b, aParent, bParent, prop, compare, options)) {
                    var subsetCheck;
                    if (!(prop in aParent)) {
                        subsetCheck = 'subsetB';
                    }
                    if (!(prop in bParent)) {
                        subsetCheck = 'subsetA';
                    }
                    if (subsetCheck) {
                        if (!options.subset) {
                            options.subset = subsetCheck;
                        }
                        return options.subset === subsetCheck ? undefined : false;
                    }
                    return false;
                }
            };
            var aType = typeof a;
            if (aType === 'object' || aType === 'function') {
                return h.eachInUnique(a, subsetCompare, b, subsetCompare, true);
            }
        },
        unionArrayLike: function (a, b, aParent, bParent, prop, compares, options) {
            if (Array.isArray(a) && Array.isArray(b)) {
                var combined = makeArray(a).concat(makeArray(b));
                h.doubleLoop(combined, function (item, j, cur, i) {
                    var res = !compareHelpers.equal(cur, item, aParent, bParent, undefined, compares['*'], { 'default': false });
                    return res;
                });
                options.result[prop] = combined;
                return true;
            }
        },
        count: function (a, b, aParent, bParent, prop, compares, options) {
            options.checks = [
                compareHelpers.countComparesType,
                compareHelpers.equalBasicTypes,
                compareHelpers.equalArrayLike,
                compareHelpers.loopObject
            ];
            options['default'] = false;
            loop(a, b, aParent, bParent, prop, compares, options);
            if (typeof options.count === 'number') {
                return options.count;
            }
            return Infinity;
        },
        countComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    return true;
                } else if (compareResult && typeof compareResult === 'object') {
                    if (typeof compareResult.count === 'number') {
                        if (!('count' in options) || compareResult.count === options.count) {
                            options.count = compareResult.count;
                        } else {
                            options.count = Infinity;
                        }
                    }
                    return true;
                }
            }
        },
        loopObject: function (a, b, aParent, bParent, prop, compares, options) {
            var aType = typeof a;
            if (aType === 'object' || aType === 'function') {
                each(a, function (aValue, prop) {
                    var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                    loop(aValue, b[prop], a, b, prop, compare, options);
                });
                return true;
            }
        },
        intersection: function (a, b, aParent, bParent, prop, compares, options) {
            options.result = {};
            options.performedIntersection = 0;
            options.checks = [
                compareHelpers.intersectionComparesType,
                addToResult(compareHelpers.equalBasicTypes, 'equalBasicTypes'),
                addToResult(compareHelpers.intersectionArrayLike, 'intersectionArrayLike'),
                compareHelpers.intersectionObject
            ];
            options['default'] = false;
            var res = loop(a, b, aParent, bParent, prop, compares, options);
            if (res === true) {
                return options.result;
            }
            return false;
        },
        intersectionComparesType: function (a, b, aParent, bParent, prop, compares, options) {
            if (typeof compares === 'function') {
                var compareResult = compares(a, b, aParent, bParent, prop, options);
                if (typeof compareResult === 'boolean') {
                    if (compareResult === true) {
                        options.result[prop] = a;
                        return true;
                    } else {
                        return compareResult;
                    }
                } else if (compareResult && typeof compareResult === 'object') {
                    if ('intersection' in compareResult) {
                        if (compareResult.intersection !== undefined) {
                            options.result[prop] = compareResult.intersection;
                        }
                        options.performedIntersection++;
                        return true;
                    }
                }
            }
        },
        intersectionObject: function (a, b, aParent, bParent, prop, compares, options) {
            var subsetCompare = function (a, b, aParent, bParent, prop) {
                var compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                if (!loop(a, b, aParent, bParent, prop, compare, options)) {
                    return addIntersectedPropertyToResult(a, b, aParent, bParent, prop, compares, options);
                }
            };
            var aType = typeof a;
            if (aType === 'object' || aType === 'function') {
                return h.eachInUnique(a, subsetCompare, b, subsetCompare, true);
            }
        },
        intersectionArrayLike: function (a, b, aParent, bParent, prop, compares, options) {
            if (Array.isArray(a) && Array.isArray(b)) {
                var intersection = [];
                each(makeArray(a), function (cur) {
                    for (var i = 0; i < b.length; i++) {
                        if (compareHelpers.equal(cur, b[i], aParent, bParent, undefined, compares['*'], { 'default': false })) {
                            intersection.push(cur);
                            break;
                        }
                    }
                });
                options.result[prop] = intersection;
                return true;
            }
        }
    };
});
/*can-set@1.3.2#src/get*/
define('can-set@1.3.2#src/get', [
    'require',
    'exports',
    'module',
    './compare',
    './helpers',
    'can-util/js/each/each'
], function (require, exports, module) {
    var compare = require('./compare');
    var h = require('./helpers');
    var each = require('can-util/js/each/each');
    var filterData = function (data, clause, props) {
        return h.filter.call(data, function (item) {
            var isSubset = compare.subset(item, clause, undefined, undefined, undefined, props, {});
            return isSubset;
        });
    };
    module.exports = {
        subsetData: function (a, b, bData, algebra) {
            var aClauseProps = algebra.getClauseProperties(a);
            var bClauseProps = algebra.getClauseProperties(b);
            var options = {};
            var aData = filterData(bData, aClauseProps.where, algebra.clauses.where);
            if (aData.length && (aClauseProps.enabled.order || bClauseProps.enabled.order)) {
                options = {};
                var propName = h.firstProp(aClauseProps.order), compareOrder = algebra.clauses.order[propName];
                aData = aData.sort(function (aItem, bItem) {
                    return compareOrder(a[propName], aItem, bItem);
                });
            }
            if (aData.length && (aClauseProps.enabled.paginate || bClauseProps.enabled.paginate)) {
                options = {};
                compare.subset(aClauseProps.paginate, bClauseProps.paginate, undefined, undefined, undefined, algebra.clauses.paginate, options);
                each(options.getSubsets, function (filter) {
                    aData = filter(a, b, aData, algebra, options);
                });
            }
            return aData;
        }
    };
});
/*can-set@1.3.2#src/set-core*/
define('can-set@1.3.2#src/set-core', [
    'require',
    'exports',
    'module',
    './helpers',
    './clause',
    './compare',
    './get',
    'can-util/js/assign/assign',
    'can-util/js/each/each',
    'can-util/js/make-array/make-array',
    'can-util/js/is-empty-object/is-empty-object'
], function (require, exports, module) {
    var h = require('./helpers');
    var clause = require('./clause');
    var compare = require('./compare');
    var get = require('./get');
    var assign = require('can-util/js/assign/assign');
    var each = require('can-util/js/each/each');
    var makeArray = require('can-util/js/make-array/make-array');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    function Translate(clause, options) {
        if (typeof options === 'string') {
            var path = options;
            options = {
                fromSet: function (set, setRemainder) {
                    return set[path] || {};
                },
                toSet: function (set, wheres) {
                    set[path] = wheres;
                    return set;
                }
            };
        }
        this.clause = clause;
        assign(this, options);
    }
    var Algebra = function () {
        var clauses = this.clauses = {
            where: {},
            order: {},
            paginate: {},
            id: {}
        };
        this.translators = {
            where: new Translate('where', {
                fromSet: function (set, setRemainder) {
                    return setRemainder;
                },
                toSet: function (set, wheres) {
                    return assign(set, wheres);
                }
            })
        };
        var self = this;
        each(arguments, function (arg) {
            if (arg) {
                if (arg instanceof Translate) {
                    self.translators[arg.clause] = arg;
                } else {
                    assign(clauses[arg.constructor.type || 'where'], arg);
                }
            }
        });
    };
    Algebra.make = function (compare, count) {
        if (compare instanceof Algebra) {
            return compare;
        } else {
            return new Algebra(compare, count);
        }
    };
    assign(Algebra.prototype, {
        getClauseProperties: function (set, options) {
            options = options || {};
            var setClone = assign({}, set);
            var clauses = this.clauses;
            var checkClauses = [
                'order',
                'paginate',
                'id'
            ];
            var clauseProps = {
                enabled: {
                    where: true,
                    order: false,
                    paginate: false,
                    id: false
                }
            };
            if (options.omitClauses) {
                checkClauses = h.arrayUnionIntersectionDifference(checkClauses, options.omitClauses).difference;
            }
            each(checkClauses, function (clauseName) {
                var valuesForClause = {};
                var prop;
                for (prop in clauses[clauseName]) {
                    if (prop in setClone) {
                        valuesForClause[prop] = setClone[prop];
                        delete setClone[prop];
                    }
                }
                clauseProps[clauseName] = valuesForClause;
                clauseProps.enabled[clauseName] = !isEmptyObject(valuesForClause);
            });
            clauseProps.where = options.isProperties ? setClone : this.translators.where.fromSet(set, setClone);
            return clauseProps;
        },
        getDifferentClauseTypes: function (aClauses, bClauses) {
            var self = this;
            var differentTypes = [];
            each(clause.TYPES, function (type) {
                if (!self.evaluateOperator(compare.equal, aClauses[type], bClauses[type], { isProperties: true }, { isProperties: true })) {
                    differentTypes.push(type);
                }
            });
            return differentTypes;
        },
        updateSet: function (set, clause, result, useSet) {
            if (result && typeof result === 'object' && useSet !== false) {
                if (this.translators[clause]) {
                    set = this.translators.where.toSet(set, result);
                } else {
                    set = assign(set, result);
                }
                return true;
            } else if (result) {
                return useSet === undefined ? undefined : false;
            } else {
                return false;
            }
        },
        evaluateOperator: function (operator, a, b, aOptions, bOptions, evaluateOptions) {
            aOptions = aOptions || {};
            bOptions = bOptions || {};
            evaluateOptions = assign({
                evaluateWhere: operator,
                evaluatePaginate: operator,
                evaluateOrder: operator,
                shouldEvaluatePaginate: function (aClauseProps, bClauseProps) {
                    return aClauseProps.enabled.paginate || bClauseProps.enabled.paginate;
                },
                shouldEvaluateOrder: function (aClauseProps, bClauseProps) {
                    return aClauseProps.enabled.order && compare.equal(aClauseProps.order, bClauseProps.order, undefined, undefined, undefined, {}, {});
                }
            }, evaluateOptions || {});
            var aClauseProps = this.getClauseProperties(a, aOptions), bClauseProps = this.getClauseProperties(b, bOptions), set = {}, useSet;
            var result = evaluateOptions.evaluateWhere(aClauseProps.where, bClauseProps.where, undefined, undefined, undefined, this.clauses.where, {});
            useSet = this.updateSet(set, 'where', result, useSet);
            if (result && evaluateOptions.shouldEvaluatePaginate(aClauseProps, bClauseProps)) {
                if (evaluateOptions.shouldEvaluateOrder(aClauseProps, bClauseProps)) {
                    result = evaluateOptions.evaluateOrder(aClauseProps.order, bClauseProps.order, undefined, undefined, undefined, {}, {});
                    useSet = this.updateSet(set, 'order', result, useSet);
                }
                if (result) {
                    result = evaluateOptions.evaluatePaginate(aClauseProps.paginate, bClauseProps.paginate, undefined, undefined, undefined, this.clauses.paginate, {});
                    useSet = this.updateSet(set, 'paginate', result, useSet);
                }
            } else if (result && evaluateOptions.shouldEvaluateOrder(aClauseProps, bClauseProps)) {
                result = operator(aClauseProps.order, bClauseProps.order, undefined, undefined, undefined, {}, {});
                useSet = this.updateSet(set, 'order', result, useSet);
            }
            return result && useSet ? set : result;
        },
        equal: function (a, b) {
            return this.evaluateOperator(compare.equal, a, b);
        },
        subset: function (a, b) {
            var aClauseProps = this.getClauseProperties(a);
            var bClauseProps = this.getClauseProperties(b);
            var compatibleSort = true;
            var result;
            if (bClauseProps.enabled.paginate && (aClauseProps.enabled.order || bClauseProps.enabled.order)) {
                compatibleSort = compare.equal(aClauseProps.order, bClauseProps.order, undefined, undefined, undefined, {}, {});
            }
            if (!compatibleSort) {
                result = false;
            } else {
                result = this.evaluateOperator(compare.subset, a, b);
            }
            return result;
        },
        properSubset: function (a, b) {
            return this.subset(a, b) && !this.equal(a, b);
        },
        difference: function (a, b) {
            var aClauseProps = this.getClauseProperties(a);
            var bClauseProps = this.getClauseProperties(b);
            var differentClauses = this.getDifferentClauseTypes(aClauseProps, bClauseProps);
            var result;
            switch (differentClauses.length) {
            case 0: {
                    result = false;
                    break;
                }
            case 1: {
                    var clause = differentClauses[0];
                    result = compare.difference(aClauseProps[clause], bClauseProps[clause], undefined, undefined, undefined, this.clauses[clause], {});
                    if (this.translators[clause] && typeof result === 'object') {
                        result = this.translators[clause].toSet({}, result);
                    }
                    break;
                }
            }
            return result;
        },
        union: function (a, b) {
            return this.evaluateOperator(compare.union, a, b);
        },
        intersection: function (a, b) {
            return this.evaluateOperator(compare.intersection, a, b);
        },
        count: function (set) {
            return this.evaluateOperator(compare.count, set, {});
        },
        has: function (set, props) {
            var aClauseProps = this.getClauseProperties(set);
            var propsClauseProps = this.getClauseProperties(props, { isProperties: true });
            var compatibleSort = true;
            var result;
            if ((propsClauseProps.enabled.paginate || aClauseProps.enabled.paginate) && (propsClauseProps.enabled.order || aClauseProps.enabled.order)) {
                compatibleSort = compare.equal(propsClauseProps.order, aClauseProps.order, undefined, undefined, undefined, {}, {});
            }
            if (!compatibleSort) {
                result = false;
            } else {
                result = this.evaluateOperator(compare.subset, props, set, { isProperties: true }, undefined, {
                    shouldEvaluatePaginate: function () {
                        return false;
                    }
                });
            }
            return result;
        },
        index: function (set, items, item) {
            var aClauseProps = this.getClauseProperties(set);
            var propName = h.firstProp(aClauseProps.order), compare, orderValue;
            if (propName) {
                compare = this.clauses.order[propName];
                orderValue = set[propName];
                return h.index(function (itemA, itemB) {
                    return compare(orderValue, itemA, itemB);
                }, items, item);
            }
            propName = h.firstProp(this.clauses.id);
            if (propName) {
                compare = h.defaultSort;
                orderValue = propName;
                return h.index(function (itemA, itemB) {
                    return compare(orderValue, itemA, itemB);
                }, items, item);
            }
            return;
        },
        getSubset: function (a, b, bData) {
            var aClauseProps = this.getClauseProperties(a);
            var bClauseProps = this.getClauseProperties(b);
            var isSubset = this.subset(assign({}, aClauseProps.where, aClauseProps.paginate), assign({}, bClauseProps.where, bClauseProps.paginate));
            if (isSubset) {
                return get.subsetData(a, b, bData, this);
            }
        },
        getUnion: function (a, b, aItems, bItems) {
            var aClauseProps = this.getClauseProperties(a);
            var bClauseProps = this.getClauseProperties(b);
            var algebra = this;
            var options;
            if (this.subset(a, b)) {
                return bItems;
            } else if (this.subset(b, a)) {
                return aItems;
            }
            var combined;
            if (aClauseProps.enabled.paginate || bClauseProps.enabled.paginate) {
                options = {};
                var isUnion = compare.union(aClauseProps.paginate, bClauseProps.paginate, undefined, undefined, undefined, this.clauses.paginate, options);
                if (!isUnion) {
                    return;
                } else {
                    each(options.getUnions, function (filter) {
                        var items = filter(a, b, aItems, bItems, algebra, options);
                        aItems = items[0];
                        bItems = items[1];
                    });
                    combined = aItems.concat(bItems);
                }
            } else {
                combined = aItems.concat(bItems);
            }
            if (combined.length && aClauseProps.enabled.order && compare.equal(aClauseProps.order, bClauseProps.order, undefined, undefined, undefined, {}, {})) {
                options = {};
                var propName = h.firstProp(aClauseProps.order), compareOrder = algebra.clauses.order[propName];
                combined = combined.sort(function (aItem, bItem) {
                    return compareOrder(a[propName], aItem, bItem);
                });
            }
            return combined;
        },
        id: function (props) {
            var keys = Object.keys(this.clauses.id);
            if (keys.length === 1) {
                return props[keys[0]];
            } else {
                var id = {};
                keys.forEach(function (key) {
                    id[key] = props[key];
                });
                return JSON.stringify(id);
            }
        }
    });
    var callOnAlgebra = function (methodName, algebraArgNumber) {
        return function () {
            var args = makeArray(arguments).slice(0, algebraArgNumber);
            var algebra = Algebra.make(arguments[algebraArgNumber]);
            return algebra[methodName].apply(algebra, args);
        };
    };
    module.exports = {
        Algebra: Algebra,
        Translate: Translate,
        difference: callOnAlgebra('difference', 2),
        equal: callOnAlgebra('equal', 2),
        subset: callOnAlgebra('subset', 2),
        properSubset: callOnAlgebra('properSubset', 2),
        union: callOnAlgebra('union', 2),
        intersection: callOnAlgebra('intersection', 2),
        count: callOnAlgebra('count', 1),
        has: callOnAlgebra('has', 2),
        index: callOnAlgebra('index', 3),
        getSubset: callOnAlgebra('getSubset', 3),
        getUnion: callOnAlgebra('getUnion', 4)
    };
});
/*can-set@1.3.2#src/props*/
define('can-set@1.3.2#src/props', [
    'require',
    'exports',
    'module',
    './helpers',
    './clause',
    'can-util/js/each/each'
], function (require, exports, module) {
    var h = require('./helpers');
    var clause = require('./clause');
    var each = require('can-util/js/each/each');
    var within = function (value, range) {
        return value >= range[0] && value <= range[1];
    };
    var numericProperties = function (setA, setB, property1, property2) {
        return {
            sAv1: +setA[property1],
            sAv2: +setA[property2],
            sBv1: +setB[property1],
            sBv2: +setB[property2]
        };
    };
    var diff = function (setA, setB, property1, property2) {
        var numProps = numericProperties(setA, setB, property1, property2);
        var sAv1 = numProps.sAv1, sAv2 = numProps.sAv2, sBv1 = numProps.sBv1, sBv2 = numProps.sBv2, count = sAv2 - sAv1 + 1;
        var after = {
            difference: [
                sBv2 + 1,
                sAv2
            ],
            intersection: [
                sAv1,
                sBv2
            ],
            union: [
                sBv1,
                sAv2
            ],
            count: count,
            meta: 'after'
        };
        var before = {
            difference: [
                sAv1,
                sBv1 - 1
            ],
            intersection: [
                sBv1,
                sAv2
            ],
            union: [
                sAv1,
                sBv2
            ],
            count: count,
            meta: 'before'
        };
        if (sAv1 === sBv1 && sAv2 === sBv2) {
            return {
                intersection: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sAv1,
                    sAv2
                ],
                count: count,
                meta: 'equal'
            };
        } else if (sAv1 === sBv1 && sBv2 < sAv2) {
            return after;
        } else if (sAv2 === sBv2 && sBv1 > sAv1) {
            return before;
        } else if (within(sAv1, [
                sBv1,
                sBv2
            ]) && within(sAv2, [
                sBv1,
                sBv2
            ])) {
            return {
                intersection: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sBv1,
                    sBv2
                ],
                count: count,
                meta: 'subset'
            };
        } else if (within(sBv1, [
                sAv1,
                sAv2
            ]) && within(sBv2, [
                sAv1,
                sAv2
            ])) {
            return {
                intersection: [
                    sBv1,
                    sBv2
                ],
                difference: [
                    null,
                    null
                ],
                union: [
                    sAv1,
                    sAv2
                ],
                count: count,
                meta: 'superset'
            };
        } else if (sAv1 < sBv1 && within(sAv2, [
                sBv1,
                sBv2
            ])) {
            return before;
        } else if (sBv1 < sAv1 && within(sBv2, [
                sAv1,
                sAv2
            ])) {
            return after;
        } else if (sAv2 === sBv1 - 1) {
            return {
                difference: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sAv1,
                    sBv2
                ],
                count: count,
                meta: 'disjoint-before'
            };
        } else if (sBv2 === sAv1 - 1) {
            return {
                difference: [
                    sAv1,
                    sAv2
                ],
                union: [
                    sBv1,
                    sAv2
                ],
                count: count,
                meta: 'disjoint-after'
            };
        }
        if (!isNaN(count)) {
            return {
                count: count,
                meta: 'disjoint'
            };
        }
    };
    var cleanUp = function (value, enumData) {
        if (!value) {
            return enumData;
        }
        if (!Array.isArray(value)) {
            value = [value];
        }
        if (!value.length) {
            return enumData;
        }
        return value;
    };
    var stringConvert = {
        '0': false,
        'false': false,
        'null': undefined,
        'undefined': undefined
    };
    var convertToBoolean = function (value) {
        if (typeof value === 'string') {
            return value.toLowerCase() in stringConvert ? stringConvert[value.toLowerCase()] : true;
        }
        return value;
    };
    var props = {
        'enum': function (prop, enumData) {
            var compares = new clause.Where({});
            compares[prop] = function (vA, vB, A, B) {
                vA = cleanUp(vA, enumData);
                vB = cleanUp(vB, enumData);
                var data = h.arrayUnionIntersectionDifference(vA, vB);
                if (!data.difference.length) {
                    delete data.difference;
                }
                each(data, function (value, prop) {
                    if (Array.isArray(value)) {
                        if (h.arraySame(enumData, value)) {
                            data[prop] = undefined;
                        } else if (value.length === 1) {
                            data[prop] = value[0];
                        }
                    }
                });
                return data;
            };
            return compares;
        },
        paginate: function (propStart, propEnd, translateToStartEnd, reverseTranslate) {
            var compares = {};
            var makeResult = function (result, index) {
                var res = {};
                each([
                    'intersection',
                    'difference',
                    'union'
                ], function (prop) {
                    if (result[prop]) {
                        var set = {
                            start: result[prop][0],
                            end: result[prop][1]
                        };
                        res[prop] = reverseTranslate(set)[index === 0 ? propStart : propEnd];
                    }
                });
                if (result.count) {
                    res.count = result.count;
                }
                return res;
            };
            compares[propStart] = function (vA, vB, A, B) {
                if (vA === undefined) {
                    return;
                }
                var res = diff(translateToStartEnd(A), translateToStartEnd(B), 'start', 'end');
                var result = makeResult(res, 0);
                result.getSubset = function (a, b, bItems, algebra, options) {
                    return bItems;
                };
                result.getUnion = function (a, b, aItems, bItems, algebra, options) {
                    return [
                        aItems,
                        bItems
                    ];
                };
                return result;
            };
            compares[propEnd] = function (vA, vB, A, B) {
                if (vA === undefined) {
                    return;
                }
                var data = diff(translateToStartEnd(A), translateToStartEnd(B), 'start', 'end');
                var res = makeResult(data, 1);
                res.getSubset = function (a, b, bItems, algebra, options) {
                    var tA = translateToStartEnd(a);
                    var tB = translateToStartEnd(b);
                    var numProps = numericProperties(tA, tB, 'start', 'end');
                    var aStartValue = numProps.sAv1, aEndValue = numProps.sAv2;
                    var bStartValue = numProps.sBv1;
                    if (!('end' in tB) || !('end' in tA)) {
                        return bItems.slice(aStartValue, aEndValue + 1);
                    }
                    return bItems.slice(aStartValue - bStartValue, aEndValue - bStartValue + 1);
                };
                res.getUnion = function (a, b, aItems, bItems, algebra, options) {
                    var tA = translateToStartEnd(a);
                    var tB = translateToStartEnd(b);
                    if (data.meta.indexOf('after') >= 0) {
                        if (data.intersection) {
                            bItems = bItems.slice(0, data.intersection[0] - +tB.start);
                        }
                        return [
                            bItems,
                            aItems
                        ];
                    }
                    if (data.intersection) {
                        aItems = aItems.slice(0, data.intersection[0] - +tA.start);
                    }
                    return [
                        aItems,
                        bItems
                    ];
                };
                return res;
            };
            return new clause.Paginate(compares);
        },
        'boolean': function (propertyName) {
            var compares = new clause.Where({});
            compares[propertyName] = function (propA, propB) {
                propA = convertToBoolean(propA);
                propB = convertToBoolean(propB);
                var notA = !propA, notB = !propB;
                if (propA === notB && propB === notA) {
                    return {
                        difference: !propB,
                        union: undefined
                    };
                } else if (propA === undefined) {
                    return {
                        difference: !propB,
                        intersection: propB,
                        union: undefined
                    };
                } else if (propA === propB) {
                    return true;
                }
            };
            return compares;
        },
        'sort': function (prop, sortFunc) {
            if (!sortFunc) {
                sortFunc = h.defaultSort;
            }
            var compares = {};
            compares[prop] = sortFunc;
            return new clause.Order(compares);
        },
        'id': function (prop) {
            var compares = {};
            compares[prop] = prop;
            return new clause.Id(compares);
        }
    };
    var assignExcept = function (d, s, props) {
        for (var prop in s) {
            if (!props[prop]) {
                d[prop] = s[prop];
            }
        }
        return d;
    };
    var translateToOffsetLimit = function (set, offsetProp, limitProp) {
        var newSet = assignExcept({}, set, {
            start: 1,
            end: 1
        });
        if ('start' in set) {
            newSet[offsetProp] = set.start;
        }
        if ('end' in set) {
            newSet[limitProp] = set.end - set.start + 1;
        }
        return newSet;
    };
    var translateToStartEnd = function (set, offsetProp, limitProp) {
        var except = {};
        except[offsetProp] = except[limitProp] = 1;
        var newSet = assignExcept({}, set, except);
        if (offsetProp in set) {
            newSet.start = parseInt(set[offsetProp], 10);
        }
        if (limitProp in set) {
            newSet.end = newSet.start + parseInt(set[limitProp]) - 1;
        }
        return newSet;
    };
    props.offsetLimit = function (offsetProp, limitProp) {
        offsetProp = offsetProp || 'offset';
        limitProp = limitProp || 'limit';
        return props.paginate(offsetProp, limitProp, function (set) {
            return translateToStartEnd(set, offsetProp, limitProp);
        }, function (set) {
            return translateToOffsetLimit(set, offsetProp, limitProp);
        });
    };
    props.rangeInclusive = function (startIndexProperty, endIndexProperty) {
        startIndexProperty = startIndexProperty || 'start';
        endIndexProperty = endIndexProperty || 'end';
        return props.paginate(startIndexProperty, endIndexProperty, function (set) {
            var except = {};
            except[startIndexProperty] = except[endIndexProperty] = 1;
            var newSet = assignExcept({}, set, except);
            if (startIndexProperty in set) {
                newSet.start = set[startIndexProperty];
            }
            if (endIndexProperty in set) {
                newSet.end = set[endIndexProperty];
            }
            return newSet;
        }, function (set) {
            var except = {
                start: 1,
                end: 1
            };
            var newSet = assignExcept({}, set, except);
            newSet[startIndexProperty] = set.start;
            newSet[endIndexProperty] = set.end;
            return newSet;
        });
    };
    var nestedLookup = function (obj, propNameArray) {
        if (obj === undefined) {
            return undefined;
        }
        if (propNameArray.length === 1) {
            return obj[propNameArray[0]];
        } else {
            return nestedLookup(obj[propNameArray[0]], propNameArray.slice(1));
        }
    };
    props.dotNotation = function (dotProperty) {
        var compares = new clause.Where({});
        compares[dotProperty] = function (aVal, bVal, a, b, propertyName) {
            if (aVal === undefined) {
                aVal = nestedLookup(a, propertyName.split('.'));
            }
            if (bVal === undefined) {
                bVal = nestedLookup(b, propertyName.split('.'));
            }
            return aVal === bVal;
        };
        return compares;
    };
    module.exports = props;
});
/*can-set@1.3.2#src/set*/
define('can-set@1.3.2#src/set', [
    'require',
    'exports',
    'module',
    './set-core',
    'can-namespace',
    './props',
    './clause',
    './helpers'
], function (require, exports, module) {
    var set = require('./set-core');
    var ns = require('can-namespace');
    var props = require('./props');
    var clause = require('./clause');
    set.comparators = props;
    set.props = props;
    set.helpers = require('./helpers');
    set.clause = clause;
    module.exports = ns.set = set;
});
/*can-connect@1.5.5#helpers/set-add*/
define('can-connect@1.5.5#helpers/set-add', [
    'require',
    'exports',
    'module',
    'can-set'
], function (require, exports, module) {
    var canSet = require('can-set');
    module.exports = function (connection, setItems, items, item, algebra) {
        var index = canSet.index(setItems, items, item, algebra);
        if (index === undefined) {
            index = items.length;
        }
        var copy = items.slice(0);
        copy.splice(index, 0, item);
        return copy;
    };
});
/*can-connect@1.5.5#helpers/get-index-by-id*/
define('can-connect@1.5.5#helpers/get-index-by-id', function (require, exports, module) {
    module.exports = function (connection, props, items) {
        var id = connection.id(props);
        for (var i = 0; i < items.length; i++) {
            var connId = connection.id(items[i]);
            if (id == connId) {
                return i;
            }
        }
        return -1;
    };
});
/*can-connect@1.5.5#real-time/real-time*/
define('can-connect@1.5.5#real-time/real-time', [
    'require',
    'exports',
    'module',
    '../can-connect',
    'can-set',
    'can-connect/helpers/set-add',
    'can-connect/helpers/get-index-by-id',
    'can-util/js/dev/dev'
], function (require, exports, module) {
    var connect = require('../can-connect');
    var canSet = require('can-set');
    var setAdd = require('can-connect/helpers/set-add');
    var indexOf = require('can-connect/helpers/get-index-by-id');
    var canDev = require('can-util/js/dev/dev');
    module.exports = connect.behavior('real-time', function (baseConnection) {
        var createPromise = Promise.resolve();
        return {
            createData: function () {
                var promise = baseConnection.createData.apply(this, arguments);
                var cleanPromise = promise.catch(function () {
                    return '';
                });
                createPromise = Promise.all([
                    createPromise,
                    cleanPromise
                ]);
                return promise;
            },
            createInstance: function (props) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    createPromise.then(function () {
                        setTimeout(function () {
                            var id = self.id(props);
                            var instance = self.instanceStore.get(id);
                            var serialized;
                            if (instance) {
                                resolve(self.updateInstance(props));
                            } else {
                                instance = self.hydrateInstance(props);
                                serialized = self.serializeInstance(instance);
                                self.addInstanceReference(instance);
                                Promise.resolve(self.createdData(props, serialized)).then(function () {
                                    self.deleteInstanceReference(instance);
                                    resolve(instance);
                                });
                            }
                        }, 1);
                    });
                });
            },
            createdData: function (props, params, cid) {
                var instance;
                if (cid !== undefined) {
                    instance = this.cidStore.get(cid);
                } else {
                    instance = this.instanceStore.get(this.id(props));
                }
                this.addInstanceReference(instance, this.id(props));
                this.createdInstance(instance, props);
                create.call(this, this.serializeInstance(instance));
                this.deleteInstanceReference(instance);
                return undefined;
            },
            updatedData: function (props, params) {
                var instance = this.instanceStore.get(this.id(params));
                this.updatedInstance(instance, props);
                update.call(this, this.serializeInstance(instance));
                return undefined;
            },
            updateInstance: function (props) {
                var id = this.id(props);
                var instance = this.instanceStore.get(id);
                if (!instance) {
                    instance = this.hydrateInstance(props);
                }
                this.addInstanceReference(instance);
                var serialized = this.serializeInstance(instance), self = this;
                return Promise.resolve(this.updatedData(props, serialized)).then(function () {
                    self.deleteInstanceReference(instance);
                    return instance;
                });
            },
            destroyedData: function (props, params) {
                var id = this.id(params || props);
                var instance = this.instanceStore.get(id);
                if (!instance) {
                    instance = this.hydrateInstance(props);
                }
                var serialized = this.serializeInstance(instance);
                this.destroyedInstance(instance, props);
                destroy.call(this, serialized);
                return undefined;
            },
            destroyInstance: function (props) {
                var id = this.id(props);
                var instance = this.instanceStore.get(id);
                if (!instance) {
                    instance = this.hydrateInstance(props);
                }
                this.addInstanceReference(instance);
                var serialized = this.serializeInstance(instance), self = this;
                return Promise.resolve(this.destroyedData(props, serialized)).then(function () {
                    self.deleteInstanceReference(instance);
                    return instance;
                });
            }
        };
    });
    var create = function (props) {
        var self = this;
        this.listStore.forEach(function (list, id) {
            var set = JSON.parse(id);
            var index = indexOf(self, props, list);
            if (canSet.has(set, props, self.algebra)) {
                if (index === -1) {
                    var items = self.serializeList(list);
                    self.updatedList(list, { data: setAdd(self, set, items, props, self.algebra) }, set);
                } else {
                }
            }
        });
    };
    var update = function (props) {
        var self = this;
        this.listStore.forEach(function (list, id) {
            var items;
            var set = JSON.parse(id);
            var index = indexOf(self, props, list);
            if (canSet.has(set, props, self.algebra)) {
                items = self.serializeList(list);
                if (index === -1) {
                    self.updatedList(list, { data: setAdd(self, set, items, props, self.algebra) }, set);
                } else {
                    var sortedIndex = canSet.index(set, items, props, self.algebra);
                    if (sortedIndex !== undefined && sortedIndex !== index) {
                        var copy = items.slice(0);
                        if (index < sortedIndex) {
                            copy.splice(sortedIndex, 0, props);
                            copy.splice(index, 1);
                        } else {
                            copy.splice(index, 1);
                            copy.splice(sortedIndex, 0, props);
                        }
                        self.updatedList(list, { data: copy }, set);
                    }
                }
            } else if (index !== -1) {
                items = self.serializeList(list);
                items.splice(index, 1);
                self.updatedList(list, { data: items }, set);
            }
        });
    };
    var destroy = function (props) {
        var self = this;
        this.listStore.forEach(function (list, id) {
            var set = JSON.parse(id);
            var index = indexOf(self, props, list);
            if (index !== -1) {
                var items = self.serializeList(list);
                items.splice(index, 1);
                self.updatedList(list, { data: items }, set);
            }
        });
    };
});
/*can-connect@1.5.5#constructor/callbacks-once/callbacks-once*/
define('can-connect@1.5.5#constructor/callbacks-once/callbacks-once', [
    'require',
    'exports',
    'module',
    'can-connect',
    'can-connect/helpers/sorted-set-json'
], function (require, exports, module) {
    var connect = require('can-connect');
    var sortedSetJSON = require('can-connect/helpers/sorted-set-json');
    var forEach = [].forEach;
    var callbacks = [
        'createdInstance',
        'updatedInstance',
        'destroyedInstance'
    ];
    var callbacksOnceBehavior = connect.behavior('constructor/callbacks-once', function (baseConnection) {
        var behavior = {};
        forEach.call(callbacks, function (name) {
            behavior[name] = function (instance, data) {
                var lastSerialized = this.getInstanceMetaData(instance, 'last-data-' + name);
                var serialize = sortedSetJSON(data);
                if (lastSerialized !== serialize) {
                    var result = baseConnection[name].apply(this, arguments);
                    this.addInstanceMetaData(instance, 'last-data-' + name, serialize);
                    return result;
                }
            };
        });
        return behavior;
    });
    module.exports = callbacksOnceBehavior;
});
/*can-admin@0.1.1#behaviors/flask-restless/lib/behaviors/Params*/
define('can-admin@0.1.1#behaviors/flask-restless/lib/behaviors/Params', [
    'exports',
    'can-define/map/map',
    'can-define/list/list'
], function (exports, _map, _list) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.ParameterMap = exports.SortMap = exports.FilterList = exports.FilterMap = exports.FilterSerializers = undefined;
    var _map2 = _interopRequireDefault(_map);
    var _list2 = _interopRequireDefault(_list);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    var FilterSerializers = exports.FilterSerializers = {
        not_like: { operator: 'not_like' },
        like: {
            operator: 'like',
            serialize: function serialize(val) {
                return [
                    '%',
                    val,
                    '%'
                ].join('');
            }
        },
        starts_with: {
            operator: 'like',
            serialize: function serialize(val) {
                return [
                    val,
                    '%'
                ].join('');
            }
        },
        ends_with: {
            operator: 'like',
            serialize: function serialize(val) {
                return [
                    '%',
                    val
                ].join('');
            }
        },
        equals: { operator: 'equals' },
        not_equal_to: { operator: 'not_equal_to' },
        greater_than: {
            operator: '>',
            serialize: function serialize(val) {
                return parseFloat(val);
            }
        },
        less_than: {
            operator: '<',
            serialize: function serialize(val) {
                return parseFloat(val);
            }
        },
        before: { operator: '<' },
        after: { operator: '>' }
    };
    var FilterMap = exports.FilterMap = _map2.default.extend('Filter', {
        name: {
            type: 'string',
            value: ''
        },
        operator: {
            serialize: false,
            value: 'like'
        },
        value: { serialize: false },
        op: {
            type: 'string',
            serialize: function serialize() {
                if (this.value === null) {
                    return 'is_null';
                }
                var val = this.operator;
                var op = FilterSerializers[val];
                if (op) {
                    val = op.operator;
                }
                return val;
            }
        },
        val: {
            serialize: function serialize() {
                var val = this.value;
                if (val && this.operator) {
                    var op = FilterSerializers[this.operator];
                    if (op && op.serialize) {
                        return op.serialize(val);
                    }
                }
                return val;
            }
        }
    });
    var FilterList = exports.FilterList = _list2.default.extend('FilterList', { '#': FilterMap });
    var SortMap = exports.SortMap = _map2.default.extend('Sort', {
        field: {
            type: 'string',
            value: ''
        },
        type: {
            type: 'string',
            value: 'asc'
        }
    });
    var ParameterMap = exports.ParameterMap = _map2.default.extend('Parameter', {
        sort: {
            Type: SortMap,
            serialize: function serialize(sort) {
                if (!sort) {
                    return undefined;
                }
                var field = sort.field;
                if (!field) {
                    return undefined;
                }
                return sort.type === 'asc' ? field : '-' + field;
            }
        },
        filters: {
            Type: FilterList,
            Value: FilterList,
            serialize: false
        },
        page: {
            type: 'number',
            value: 0,
            serialize: false
        },
        perPage: {
            type: 'number',
            value: 10,
            serialize: false
        },
        'filter[objects]': {
            serialize: function serialize() {
                var filters = this.filters;
                if (filters && filters.length) {
                    return JSON.stringify(filters.filter(function (f) {
                        return f.value === 0 || f.value === false || Boolean(f.value);
                    }).serialize());
                } else {
                    return undefined;
                }
            }
        },
        'page[number]': {
            serialize: function serialize() {
                if (this.page) {
                    return this.page + 1;
                }
                return undefined;
            }
        },
        'page[size]': {
            serialize: function serialize() {
                if (this.perPage !== 10) {
                    return this.perPage;
                }
                return undefined;
            }
        }
    });
    exports.default = ParameterMap;
});
/*can-admin@0.1.1#behaviors/flask-restless/lib/behaviors/algebra*/
define('can-admin@0.1.1#behaviors/flask-restless/lib/behaviors/algebra', [
    'exports',
    'can-set'
], function (exports, _canSet) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var _canSet2 = _interopRequireDefault(_canSet);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    function sort(sortDef, item1, item2) {
        var prop1 = String(item1[sortDef.fieldName]).toLowerCase();
        var prop2 = String(item2[sortDef.fieldName]).toLowerCase();
        if (prop1 !== 0 && prop1 !== false && !prop1) {
            return sortDef.type === 'asc' ? 1 : -1;
        }
        if (prop2 !== 0 && prop2 !== false && !prop2) {
            return sortDef.type === 'asc' ? -1 : 1;
        }
        if (sortDef.type === 'asc') {
            return prop1 > prop2 ? 1 : -1;
        }
        return prop1 > prop2 ? -1 : 1;
    }
    var algebra = new _canSet2.default.Algebra(_canSet2.default.props.sort('sort', sort), {
        filters: function filters(none, _filters, item) {
            for (var i = 0; i < _filters.length; i++) {
                var filter = _filters[i];
                if (!filter.value) {
                    return true;
                }
                if (typeof item[filter.name] === 'undefined') {
                    break;
                }
                var val = item[filter.name];
                switch (filter.operator) {
                case 'like':
                    if (typeof val !== 'string' || typeof filter.value !== 'string') {
                        return false;
                    }
                    if (val.toLowerCase().indexOf(filter.value.toLowerCase()) === -1) {
                        return false;
                    }
                    break;
                case 'not_like':
                    if (typeof val !== 'string') {
                        return false;
                    }
                    if (val.toLowerCase().indexOf(filter.value.toLowerCase()) > -1) {
                        return false;
                    }
                    break;
                case 'starts_with':
                    if (typeof val !== 'string') {
                        return false;
                    }
                    if (val.toLowerCase().indexOf(filter.value.toLowerCase()) !== 0) {
                        return false;
                    }
                    break;
                case 'ends_with':
                    if (typeof val !== 'string') {
                        return false;
                    }
                    if (val.toLowerCase().indexOf(filter.value.toLowerCase()) !== val.length - filter.value.length) {
                        return false;
                    }
                    break;
                case 'equals':
                    if (val != filter.value) {
                        return false;
                    }
                    break;
                case 'not_equal_to':
                    if (val == filter.value) {
                        return false;
                    }
                    break;
                case 'greater_than':
                case 'after':
                    if (val <= filter.value) {
                        return false;
                    }
                    break;
                case 'less_than':
                case 'before':
                    if (val >= filter.value) {
                        return false;
                    }
                    break;
                default:
                    return true;
                }
            }
            return true;
        },
        perPage: function perPage() {
            return true;
        },
        pageSize: function pageSize() {
            return true;
        },
        page: function page() {
            return true;
        }
    });
    exports.default = algebra;
});
/*can-admin@0.1.1#behaviors/flask-restless/lib/behaviors/restlessData*/
define('can-admin@0.1.1#behaviors/flask-restless/lib/behaviors/restlessData', [
    'exports',
    'can-connect',
    'jquery',
    './Params',
    './algebra',
    'can-define/list/list',
    'can-define/map/map'
], function (exports, _canConnect, _jquery, _Params, _algebra, _list, _map) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var _canConnect2 = _interopRequireDefault(_canConnect);
    var _jquery2 = _interopRequireDefault(_jquery);
    var _algebra2 = _interopRequireDefault(_algebra);
    var _list2 = _interopRequireDefault(_list);
    var _map2 = _interopRequireDefault(_map);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    var MetaMap = _map2.default.extend('Properties', { seal: false }, {
        total: {
            type: 'number',
            value: 0
        },
        relationships: { Value: _map2.default }
    });
    exports.default = _canConnect2.default.behavior('FlaskRestlessData', function (base) {
        return {
            init: function init() {
                this.metadata = new MetaMap();
                this.algebra = _algebra2.default;
                this.ajax = this.ajax || _jquery2.default.ajax;
                _jquery2.default.ajaxSetup({
                    dataType: 'json',
                    headers: {
                        'Accept': 'application/vnd.api+json',
                        'Content-Type': 'application/vnd.api+json'
                    }
                });
                if (!base.List) {
                    this.List = _list2.default.extend('FlaskRestlessList', { '#': base.Map });
                }
                base.init.apply(this, arguments);
            },
            getListData: function getListData(params) {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    params = new _Params.ParameterMap(params).serialize();
                    var promise = _this.ajax({
                        url: _this.url,
                        method: 'GET',
                        data: params
                    });
                    promise.then(function (props) {
                        _this.metadata.set(props.meta);
                        resolve(props);
                    }, reject);
                });
            },
            getData: function getData(params) {
                var _this2 = this;
                return new Promise(function (resolve, reject) {
                    var promise = _this2.ajax({
                        url: _this2.url + '/' + params[_this2.idProp],
                        method: 'GET'
                    });
                    promise.then(resolve, reject);
                });
            },
            createData: function createData(attrs) {
                var _this3 = this;
                return new Promise(function (resolve, reject) {
                    var data = {};
                    for (var a in attrs) {
                        if (attrs.hasOwnProperty(a) && !_this3.metadata.relationships[a]) {
                            data[a] = attrs[a];
                        }
                    }
                    var promise = _this3.ajax({
                        url: _this3.url,
                        dataType: 'json',
                        headers: {
                            'Accept': 'application/vnd.api+json',
                            'Content-Type': 'application/vnd.api+json'
                        },
                        data: JSON.stringify({
                            data: {
                                attributes: data,
                                type: _this3.name
                            }
                        }),
                        method: 'POST'
                    });
                    promise.then(resolve, reject);
                });
            },
            updateData: function updateData(attrs) {
                var _this4 = this;
                return new Promise(function (resolve, reject) {
                    var data = {};
                    for (var a in attrs) {
                        if (attrs.hasOwnProperty(a) && !_this4.metadata.relationships[a] && a !== _this4.idProp) {
                            data[a] = attrs[a];
                        }
                    }
                    var promise = _this4.ajax({
                        url: _this4.url + '/' + attrs[_this4.idProp],
                        dataType: 'json',
                        headers: {
                            'Accept': 'application/vnd.api+json',
                            'Content-Type': 'application/vnd.api+json'
                        },
                        data: JSON.stringify({
                            data: {
                                attributes: data,
                                type: _this4.name,
                                id: attrs[_this4.idProp]
                            }
                        }),
                        method: 'PATCH'
                    });
                    promise.then(resolve, reject);
                });
            },
            destroyData: function destroyData(attrs) {
                var _this5 = this;
                return new Promise(function (resolve, reject) {
                    _jquery2.default.ajax({
                        url: _this5.url + '/' + attrs[_this5.idProp],
                        dataType: 'json',
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/vnd.api+json',
                            'Content-Type': 'application/vnd.api+json'
                        }
                    }).then(resolve, reject);
                });
            }
        };
    });
});
/*can-admin@0.1.1#behaviors/flask-restless/lib/behaviors/restlessParse*/
define('can-admin@0.1.1#behaviors/flask-restless/lib/behaviors/restlessParse', [
    'exports',
    'can-connect'
], function (exports, _canConnect) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var _canConnect2 = _interopRequireDefault(_canConnect);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.default = _canConnect2.default.behavior('FlaskRestlessData', function () {
        return {
            parseListProp: 'data',
            parseInstanceData: function parseInstanceData(props) {
                if (!props) {
                    return {};
                }
                if (props.data) {
                    props = props.data;
                }
                var obj = props.attributes;
                if (!obj[this.idProp]) {
                    obj[this.idProp] = props.id;
                }
                for (var rel in props.relationships) {
                    if (props.relationships.hasOwnProperty(rel) && props.relationships[rel].hasOwnProperty('data')) {
                        obj[rel] = Array.isArray(props.relationships[rel].data) ? props.relationships[rel].data.map(function (item) {
                            return item.id;
                        }) : props.relationships[rel].data ? props.relationships[rel].data.id : null;
                        this.metadata.relationships.set(rel, true);
                    }
                }
                return obj;
            }
        };
    });
});
/*can-admin@0.1.1#behaviors/flask-restless/lib/CanRestless*/
define('can-admin@0.1.1#behaviors/flask-restless/lib/CanRestless', [
    'exports',
    'can-connect',
    'can-connect/constructor/constructor',
    'can-connect/can/map/map',
    'can-connect/can/ref/ref',
    'can-connect/constructor/store/store',
    'can-connect/data/callbacks/callbacks',
    'can-connect/data/parse/parse',
    'can-connect/real-time/real-time',
    'can-connect/constructor/callbacks-once/callbacks-once',
    './behaviors/restlessData',
    './behaviors/restlessParse',
    'can-util/js/dev/dev',
    'jquery'
], function (exports, _canConnect, _constructor, _map, _ref, _store, _callbacks, _parse, _realTime, _callbacksOnce, _restlessData, _restlessParse, _dev, _jquery) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.default = function (options) {
        var behaviors = [
            _restlessParse2.default,
            _constructor2.default,
            _map2.default,
            _ref2.default,
            _restlessData2.default,
            _store2.default,
            _callbacks2.default,
            _parse2.default,
            _realTime2.default,
            _callbacksOnce2.default
        ];
        if (options.behaviors) {
            behaviors = behaviors.concat(options.behaviors);
        }
        if (_jquery2.default && _jquery2.default.ajax) {
            options.ajax = _jquery2.default.ajax;
        }
        if (options.map) {
            _dev2.default.warn('can-admin/behaviors/flask-restless: options.map is deprecated, use options.Map instead');
            options.Map = options.map;
        }
        return (0, _canConnect2.default)(behaviors, options);
    };
    var _canConnect2 = _interopRequireDefault(_canConnect);
    var _constructor2 = _interopRequireDefault(_constructor);
    var _map2 = _interopRequireDefault(_map);
    var _ref2 = _interopRequireDefault(_ref);
    var _store2 = _interopRequireDefault(_store);
    var _callbacks2 = _interopRequireDefault(_callbacks);
    var _parse2 = _interopRequireDefault(_parse);
    var _realTime2 = _interopRequireDefault(_realTime);
    var _callbacksOnce2 = _interopRequireDefault(_callbacksOnce);
    var _restlessData2 = _interopRequireDefault(_restlessData);
    var _restlessParse2 = _interopRequireDefault(_restlessParse);
    var _dev2 = _interopRequireDefault(_dev);
    var _jquery2 = _interopRequireDefault(_jquery);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
});
/*can-admin@0.1.1#behaviors/flask-restless/index*/
define('can-admin@0.1.1#behaviors/flask-restless/index', [
    'exports',
    'can-admin/behaviors/flask-restless/lib/CanRestless'
], function (exports, _CanRestless) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var _CanRestless2 = _interopRequireDefault(_CanRestless);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.default = _CanRestless2.default;
});
/*can-admin@0.1.1#config/news/Visit*/
define('can-admin@0.1.1#config/news/Visit', [
    'exports',
    'can-define/map/map',
    'can-admin/behaviors/flask-restless/index'
], function (exports, _map, _index) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.Visit = undefined;
    var _map2 = _interopRequireDefault(_map);
    var _index2 = _interopRequireDefault(_index);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    var Visit = exports.Visit = (0, _index2.default)({
        url: '/api/visit',
        name: 'visit',
        Map: _map2.default.extend({
            id: 'string',
            article_id: 'number',
            date: {
                type: 'date',
                Value: Date
            }
        })
    });
    exports.default = {
        connection: Visit,
        title: 'Visits'
    };
});
/*can-admin@0.1.1#config/news/Person_Basic*/
define('can-admin@0.1.1#config/news/Person_Basic', [
    'exports',
    'can-define/map/map',
    'can-admin/behaviors/flask-restless/index'
], function (exports, _map, _index) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.Person = undefined;
    var _map2 = _interopRequireDefault(_map);
    var _index2 = _interopRequireDefault(_index);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    var Person = exports.Person = (0, _index2.default)({
        url: '/api/person',
        name: 'person',
        map: _map2.default.extend({
            name: 'string',
            phone_number: 'string',
            address: 'string',
            city: 'string',
            state: 'string',
            zip_code: 'number',
            is_cool: 'boolean',
            birthday: 'date',
            picture: 'string'
        })
    });
    exports.default = {
        connection: Person,
        title: 'People'
    };
});