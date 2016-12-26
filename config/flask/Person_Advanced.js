import DefineMap from 'can-define/map/map';
import DefineList from 'can-define/list/list';

//Lets create an instance of can-connect using can-restless flask factory
import factory from 'can-restless';

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

// a simple phone number regex
//https://github.com/regexhq/phone-regex/blob/master/index.js
const regexBase = '(?:\\+?(\\d{1,3}))?[-. (]*(\\d{3})[-. )]*(\\d{3})[-. ]*(\\d{4})(?: *x(\\d+))?';
const phoneRegEx = new RegExp('^' + regexBase + '$');

// get a list of states for the dropdown
const statesList = new DefineList();
import $ from 'jquery';
$.getJSON('https://gist.githubusercontent.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json').then((data) => {
    for (var key in data) {
        if (data.hasOwnProperty((key))) {
            statesList.push({
                label: data[key],
                value: key
            });
        }
    }
});

const MAPS_API = 'AIzaSyDGszAqvh2rnzJ0TGgYFwPUHRDwvL2WV5k';

export const Person = factory({
    url: '/api/person',
    name: 'person',
    map: DefineMap.extend({
        name: {
            type: 'string'
        },
        phone_number: {
            excludeListTable: true,
            type: 'string',
            set (number) {
                return number ? number.replace(/[^0-9.]/g, '') : '';
            },
            validate (value) {
                return phoneRegEx.test(value) ? null : 'Please enter a valid phone number';
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

            // pass our observable list as options
            options: statesList,
            formatter (abbrev) {
                return statesList.filter((state) => {
                    return state.value === abbrev;
                })[0].label;
            }
        },
        zip_code: {
            excludeListTable: true,
            type: 'number'
        },
        is_cool: {
            type: 'boolean',
            formatter (is_cool) {
                const icon = is_cool ? 'fa-thumbs-up' : 'fa-thumbs-down';
                return `<i class="fa  ${icon}"></i>`;
            }
        },
        birthday: {
            type: 'date',
            fieldType: 'date',
            formatter (date) {
                date = new Date(date);
                var monthNames = [
                    'January', 'February', 'March',
                    'April', 'May', 'June', 'July',
                    'August', 'September', 'October',
                    'November', 'December'
                ];

                var day = date.getDate();
                var monthIndex = date.getMonth();
                var year = date.getFullYear();
                return `${day} ${monthNames[monthIndex]} ${year}`;
            }
        },
        picture: {
            type: 'string',
            excludeListTable: true,
            formatter (img) {
                if (!img) {
                    return 'None';
                }
                return `<img src="${img}" alt="Image" style="max-width:300px;" />`;
            }
        },
        map: {
            serialize: false,
            excludeListTable: true,
            excludeForm: true,
            formatter (none, attrs) {
                const size = '300x300';
                return `<img src="https://maps.googleapis.com/maps/api/staticmap?center=${attrs.address} ${attrs.city} ${attrs.state}&size=${size}&key=${MAPS_API}" />`;
            }
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
