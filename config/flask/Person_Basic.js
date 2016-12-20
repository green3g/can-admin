// import 'can-crud/form-widget/field-components/date-field/';
import DefineMap from 'can-define/map/map';

//Lets create an instance of can-connect using can-restless flask factory
import factory from 'can-restless';

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
export const Person = factory({
    url: '/api/person',
    name: 'person',
    map: DefineMap.extend({
        name: 'string',
        phone_number: 'string',
        address: 'string',
        city: 'string',
        state: 'string',
        zip_code: 'number',
        is_cool: 'boolean',
        birthday: 'date',
        picture: 'string'
    })
});

// define our view properties
// see can-crud/crud-manager/ViewMap for documentation on available properties
// we can export default module and the crud-app will automatically use this,
// or we could export let TaskModel = {....} and specify
// moduleID in the default.js config
export default {
    connection: Person,
    title: 'People'
};
