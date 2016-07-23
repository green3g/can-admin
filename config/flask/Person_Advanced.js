import 'can-crud/form-widget/field-components/date-field/';
import CanMap from 'can/map/';

//define plugin
//https://canjs.com/docs/can.Map.prototype.define.html
import 'can/map/define/';

//Lets create an instance of can-connect using can-restless flask factory
import Factory from 'can-restless';


//import a view for a relationship
import Article from './Article';

/**

  name = db.Column(db.String)
  phone_number = db.Column(db.String(11))
  address = db.Column(db.String(500))
  city = db.Column(db.String(100))
  state = db.Column(db.String(2))
  zip_code = db.Column(db.Integer())
  is_cool = db.Column(db.Boolean)
  birthday = db.Column(db.Date)
  picture = db.Column(db.String(500))

  */
export let Person = Factory({
  url: '/api/person',
  name: 'person',
  map: CanMap.extend({

    define: {
      name: { type: 'string' },
      phone_number: {
        excludeListTable: true,
        type: 'string',
        set(number) {
          return number ? number.replace(/[^0-9.]/g, "") : '';
        }
      },
      address: {
        excludeListTable: true,
        type: 'string'
      },
      city: {
        excludeListTable: true,
        type: 'string'
      },
      state: {
        excludeListTable: true,
        type: 'string',
        fieldType: 'select',
        properties: {
          options: [{
            value: 'MN',
            label: 'Minnesota'
          }, {
            value: 'WI',
            label: 'Wisconsin'
          }, {
            value: 'IA',
            label: 'Iowa'
          }]
        }
      },
      zip_code: {
        excludeListTable: true,
        type: 'number'
      },
      is_cool: {
        type: 'boolean',
        formatter(is_cool) {
          return '<i class="fa ' +
            (is_cool ? 'fa-thumbs-up' : 'fa-thumbs-down') +
            '"></i>';
        }
      },
      birthday: {
        type: 'date',
        fieldType: 'date',
        formatter(date) {
          date = new Date(date);
          var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
          ];

          var day = date.getDate();
          var monthIndex = date.getMonth();
          var year = date.getFullYear();

          return day + ' ' + monthNames[monthIndex] + ' ' + year;
        }
      },
      picture: { type: 'string', excludeListTable: true }
    }
  })
});

// define our view properties
// see can-crud/crud-manager/ViewMap for documentation on available properties
// we can export default module and the crud-app will automatically use this,
// or we could export let TaskModel = {....} and specify
// moduleID in the default.js config
export default {
  connection: Person,
  title: 'People',
  saveSuccessMessage: 'User successfully saved',
  relatedViews: [{
    view: Article,
    foreignKey: 'id',
    referenceKey: 'author_id'
  }]
};
