//this config page merely points the loader to the various view files.
//this aids in overall app performance by only loading what is necessary
//when the view loads

//this exported object may be called config,
//or the loader will look for the default
export default {
  views: [{

    //this title gets displayed in the sidebar
    title: 'Tasks',

    //this is the absolute path to the view file
    path: 'config/default/Task',

    //this icon gets displayed in the sidebar
    iconClass: 'fa fa-tasks'

    //by default, the `default` exported module is used as the view,
    // (export default ModuleName. but if that
    //isn't your situation, you can specify moduleID to import instead
    //this will import {TasksView} from 'config/default/Task'
    //moduleID: 'TasksView'
  }]
};
