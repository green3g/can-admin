/*can-admin@0.1.1#config/news/Article*/
define('can-admin@0.1.1#config/news/Article', [
    'exports',
    'can-define/map/map',
    'can-admin/behaviors/flask-restless/index',
    'can-route',
    './Person_Basic',
    './Visit',
    'can-connect'
], function (exports, _map, _index, _canRoute, _Person_Basic, _Visit, _canConnect) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.Article = undefined;
    var _map2 = _interopRequireDefault(_map);
    var _index2 = _interopRequireDefault(_index);
    var _canRoute2 = _interopRequireDefault(_canRoute);
    var _canConnect2 = _interopRequireDefault(_canConnect);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    var Article = exports.Article = (0, _index2.default)({
        url: '/api/article',
        name: 'article',
        Map: _map2.default.extend({
            id: 'string',
            author_id: {
                list: false,
                type: 'number',
                fieldType: 'select',
                optionsPromise: new Promise(function (resolve, reject) {
                    _Person_Basic.Person.getList().then(function (data) {
                        resolve(data.map(function (person) {
                            return {
                                label: person.name,
                                value: person.id
                            };
                        }));
                    });
                })
            },
            title: {
                displayTemplate: '<a href="{{routeUrl(page=\'details\' objectId=object.id)}}">\n                <i class="fa fa-list"></i> {{object.title}}</a>',
                type: 'string'
            },
            content: {
                type: 'string',
                list: false,
                textarea: true
            },
            author: {
                serialize: false,
                list: false,
                edit: false,
                filter: false,
                displayTemplate: '{{#if object.author.isPending}}\n                <i class="fa fa-spin fa-spinner"></i>\n                {{else}}\n                <a href="{{routeUrl(view=\'people_advanced\' page=\'details\' objectId=object.author_id)}}">\n                    {{object.author.value.name}}\n                </a>\n                {{/if}}',
                set: function set(val) {
                    this.author_id = val;
                    return val;
                },
                get: function get() {
                    return _Person_Basic.Person.get({ id: this.author_id });
                }
            },
            reviewed: {
                type: 'integer',
                value: 0,
                displayTemplate: '{{#if object.reviewed}}Yes{{else}}No{{/if}}',
                fieldType: 'select',
                options: [
                    {
                        label: 'Yes',
                        value: 1
                    },
                    {
                        label: 'No',
                        value: 0
                    }
                ]
            },
            views: {
                serialize: false,
                displayTemplate: '{{#if object.views.isPending}}\n                <i class="fa fa-spin fa-spinner"></i>\n                {{else}}\n                {{object.views.value.length}}\n                {{/if}}',
                get: function get() {
                    return _Visit.Visit.getList({
                        filters: [{
                                name: 'article_id',
                                operator: 'equals',
                                value: this.id
                            }],
                        perPage: 100
                    });
                }
            }
        })
    });
    exports.default = {
        connection: Article,
        title: 'Articles',
        manageButtons: [{
                iconClass: 'fa fa-check',
                buttonClass: 'success',
                text: 'Mark Reviewed',
                onClick: function onClick(items) {
                    items.forEach(function (i) {
                        i.reviewed = 1;
                        Article.save(i).then(function () {
                        });
                    });
                }
            }],
        quickFilters: [{
                text: 'Reviewed',
                field: 'reviewed',
                options: [
                    {
                        value: 1,
                        label: 'Yes'
                    },
                    {
                        value: 0,
                        label: 'No'
                    }
                ]
            }]
    };
});