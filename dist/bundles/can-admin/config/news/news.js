/*can-admin@0.1.1#config/news/news*/
define('can-admin@0.1.1#config/news/news', ['exports'], function (exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.default = {
        views: {
            articles: {
                title: 'Articles',
                path: '~/config/news/Article',
                iconClass: 'fa fa-newspaper-o'
            },
            visits: {
                title: 'Visits',
                path: '~/config/news/Visit',
                iconClass: 'fa fa-calendar'
            },
            people_basic: {
                title: 'Authors (basic example)',
                path: '~/config/news/Person_Basic',
                iconClass: 'fa fa-user'
            },
            people_advanced: {
                title: 'Authors (advanced)',
                path: '~/config/news/Person_Advanced',
                iconClass: 'fa fa-user'
            }
        }
    };
});