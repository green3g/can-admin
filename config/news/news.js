//this config page merely points the loader to the various view files.
//this aids in overall app performance by only loading what is necessary
//when the view loads

//this exported object may be called config,
//or the loader will look for the default
export default {
    views: {
        // a collection of user articles
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
        // eslint-disable-next-line camelcase
        people_basic: {

            //this title gets displayed in the sidebar
            title: 'People (basic example)',

            //this is the absolute path to the view file
            path: '~/config/news/Person_Basic',

            //this icon gets displayed in the sidebar
            iconClass: 'fa fa-user'

        },
        // eslint-disable-next-line camelcase
        people_advanced: {
            title: 'People (advanced)',
            path: '~/config/news/Person_Advanced',
            iconClass: 'fa fa-user'
        }
    }
};
