export default {
    routes: [
        '{page}',
        '{page}/{view}/{section}',
        '{page}/{view}/{section}/{id}'
    ],
    page: 'home',
    pages: [{
        path: 'can-admin/config/pages/home/home',
        title: 'Home',
        iconClass: 'fa fa-home',
        id: 'home'
    }, {
        path: 'can-admin/config/pages/news/news',
        title: 'News Manager',
        iconClass: 'fa fa-news',
        id: 'news'
    }]
};