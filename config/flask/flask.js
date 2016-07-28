//this config page merely points the loader to the various view files.
//this aids in overall app performance by only loading what is necessary
//when the view loads

//this exported object may be called config,
//or the loader will look for the default
export default {
  views: {
    people_basic: {

      //this title gets displayed in the sidebar
      title: 'People (basic example)',

      //this is the absolute path to the view file
      path: '~/config/flask/Person_Basic',

      //this icon gets displayed in the sidebar
      iconClass: 'fa fa-user'

    },
    people_advanced: {
      title: 'People (advanced)',
      path: '~/config/flask/Person_Advanced',
      iconClass: 'fa fa-user'
    },
    articles: {
      title: 'Articles',
      path: '~/config/flask/Article',
      iconClass: 'fa fa-newspaper-o'
    },
    visits: {
      title: 'Visits',
      path: '~/config/flask/Visit',
      iconClass: 'fa fa-calendar'
    }
  }
};
