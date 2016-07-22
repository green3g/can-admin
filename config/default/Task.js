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
  '/tasks': function(request) {
    return {
      data: [
        { id: 1, name: "mow lawn", status: "assigned" },
        { id: 2, name: "do dishes", status: "new" },
        { id: 3, name: "change bulb", status: "complete" }
      ]
    };
  }
});

// define our view properties 
// see can-crud/crud-manager/ViewMap for documentation on available properties
// we can export default module and the crud-app will automatically use this,
// or we could export let TaskModel = {....} and specify
// moduleID in the default.js config
export default {
  connection: TaskConnection,
  objectTemplate: CanMap.extend({

    //define our field and objects behavior
    //see can-crud/util/Field for documentation on available properties
    define: {
      id: {
        type: 'number'
      },
      name: {
        type: 'string',
        value: ''
      },
      status: {
        type: 'string',
        value: 'Incomplete',
        fieldType: 'select',
        properties: {
          options: [{
            value: 'Complete',
            label: 'Complete'
          }, {
            value: 'Incomplete',
            label: 'Incomplete'
          }]
        },
        formatter(val) {
          let iconClass = val === 'Complete' ?
            'fa fa-check-circle-o' : 'fa fa-circle-o';
          return '<i class="' + iconClass + '"></i>';
        }
      },
      date_completed: {
        type: 'date',
        fieldType: 'date'
      }
    }
  }),
  iconClass: 'fa fa-tasks',
  id: 'task',
  title: 'Tasks'
    //we could also define custom fields here if we wanted to
    //fields: TaskFields
};
