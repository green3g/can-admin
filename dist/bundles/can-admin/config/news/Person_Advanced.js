/*can-admin@0.1.1#config/news/Person_Advanced*/
define('can-admin@0.1.1#config/news/Person_Advanced', [
    'exports',
    'can-define/map/map',
    'can-define/list/list',
    'can-admin/behaviors/flask-restless/index',
    './Article',
    'jquery'
], function (exports, _map, _list, _index, _Article, _jquery) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.Person = undefined;
    var _map2 = _interopRequireDefault(_map);
    var _list2 = _interopRequireDefault(_list);
    var _index2 = _interopRequireDefault(_index);
    var _Article2 = _interopRequireDefault(_Article);
    var _jquery2 = _interopRequireDefault(_jquery);
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    var regexBase = '(?:\\+?(\\d{1,3}))?[-. (]*(\\d{3})[-. )]*(\\d{3})[-. ]*(\\d{4})(?: *x(\\d+))?';
    var phoneRegEx = new RegExp('^' + regexBase + '$');
    var statesList = new _list2.default();
    _jquery2.default.getJSON('https://gist.githubusercontent.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json').then(function (data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                statesList.push({
                    label: data[key],
                    value: key
                });
            }
        }
    });
    var MAPS_API = 'AIzaSyDGszAqvh2rnzJ0TGgYFwPUHRDwvL2WV5k';
    var Person = exports.Person = (0, _index2.default)({
        url: '/api/person',
        name: 'person',
        map: _map2.default.extend({
            name: {
                type: 'string',
                displayTemplate: '<a href="{{routeUrl(view=\'people_advanced\' page=\'details\' objectId=object.id)}}">\n                <i class="fa fa-user fa-fw"></i> {{object.name}}</a>'
            },
            phone_number: {
                list: false,
                type: 'string',
                set: function set(number) {
                    return number ? number.replace(/[^0-9.]/g, '') : '';
                },
                validate: function validate(props) {
                    var number = props.value;
                    number = number ? number.replace(/[^0-9.]/g, '') : '';
                    return number.length > 9 && number.length < 16 ? '' : 'Please enter a valid phone number';
                }
            },
            address: {
                list: false,
                type: 'string'
            },
            city: {
                list: false,
                type: 'string'
            },
            state: {
                list: false,
                type: 'string',
                fieldType: 'select',
                options: statesList,
                formatter: function formatter(abbrev) {
                    return statesList.filter(function (state) {
                        return state.value === abbrev;
                    })[0].label;
                }
            },
            zip_code: {
                list: false,
                type: 'number'
            },
            is_cool: {
                type: 'boolean',
                formatter: function formatter(isCool) {
                    var icon = isCool ? 'fa-thumbs-up' : 'fa-thumbs-down';
                    return '<i class="fa  ' + icon + '"></i>';
                }
            },
            birthday: {
                type: 'date',
                fieldType: 'date',
                formatter: function formatter(date) {
                    date = new Date(date);
                    var monthNames = [
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December'
                    ];
                    var day = date.getDate();
                    var monthIndex = date.getMonth();
                    var year = date.getFullYear();
                    return day + ' ' + monthNames[monthIndex] + ' ' + year;
                }
            },
            picture: {
                type: 'string',
                list: false,
                formatter: function formatter(img) {
                    if (!img) {
                        return 'None';
                    }
                    return '<img src="' + img + '" alt="Image" style="max-width:300px;" />';
                }
            },
            map: {
                serialize: false,
                list: false,
                edit: false,
                formatter: function formatter(none, attrs) {
                    var size = '300x300';
                    return '<img src="https://maps.googleapis.com/maps/api/staticmap?center=' + attrs.address + ' ' + attrs.city + ' ' + attrs.state + '&size=' + size + '&key=' + MAPS_API + '" />';
                }
            }
        })
    });
    exports.default = {
        connection: Person,
        title: 'Authors',
        titleProp: 'name',
        saveSuccessMessage: 'User successfully saved',
        relatedViews: [{
                view: _Article2.default,
                foreignKey: 'id',
                referenceKey: 'author_id'
            }]
    };
});