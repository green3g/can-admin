import 'can-crud/form-widget/field-components/date-field/';
import CanMap from 'can/map/';
import List from 'can/list/';
//define plugin
//https://canjs.com/docs/can.Map.prototype.define.html
import 'can/map/define/';

//Lets create an instance of can-connect
//and import our components that we're using
import connect from 'can-connect';
import 'can-connect/data/url/';
import 'can-connect/constructor/';

export let TaskConnection = connect(['data-url', 'constructor'], {
  url: '/tasks',
  name: 'tasks'
});

// Trap ajax requests to return and modify the following `todo` object.
// this is so we can simulate an ajax request for the demo...
import fixture from 'can/util/fixture/';
fixture({
  '/tasks?{params}': function(request){
    return {
      data: [
        {id: 1, name: "mow lawn", status: "assigned"},
        {id: 2, name: "do dishes", status: "new"},
        {id: 3, name: "change bulb", status: "complete"}
      ]
    };
  }
});

//this is optional but eventually should be configured
//to customize the display and behavior of each field on the data model
export let TaskFields = null;


export let config = {
  views: [{
    connection: TaskConnection,
    objectTemplate: CanMap.extend({
      id: null,
      name: '',
      status: 'new'
    }),
    iconClass: 'fa fa-tasks',
    id: 'task',
    title: 'Tasks',
    fields: TaskFields
  }]
};
