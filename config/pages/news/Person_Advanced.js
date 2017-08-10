import DefineMap from 'can-define/map/map';
import DefineList from 'can-define/list/list';

//Lets create an instance of can-connect using can-restless flask factory
import factory from 'can-admin/behaviors/flask-restless/index';

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
            type: 'string',
            displayTemplate: `<a href="{{routeUrl(view='people_advanced' page='details' objectId=object.id, true)}}">
                <i class="fa fa-user fa-fw"></i> {{object.name}}</a>`
        },
        // eslint-disable-next-line camelcase
        phone_number: {
            list: false,
            type: 'string',
            set (number) {
                return number ? number.replace(/[^0-9.]/g, '') : '';
            },
            validate (props) {
                let number = props.value;
                number = number ? number.replace(/[^0-9.]/g, '') : '';
                return number.length > 9 && number.length < 16 
                    ? '' : 'Please enter a valid phone number';
            }
        },
        address: {
            list: false,
            type: 'string'
        },
        city: {
            list: false,
            type: 'string'
        },
        state: {
            list: false,
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
        // eslint-disable-next-line camelcase
        zip_code: {
            list: false,
            type: 'number'
        },
        // eslint-disable-next-line camelcase
        is_cool: 'boolean',
        birthday: {
            type: 'date',
            ui: 'datepicker',
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
            list: false,
            displayTemplate: `<img src="{{object.picture}}" alt="Image" style="max-width:300px;" />`
        },
        map: {
            serialize: false,
            list: false,
            edit: false,
            displayTemplate: `<img 
                src="https://maps.googleapis.com/maps/api/staticmap?center={{object.address}}{{object.city}}{{object.state}}&size=300x300&key=${MAPS_API}" />`
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
    title: 'Authors',
    id: 'people_advanced',
    titleProp: 'name',
    saveSuccessMessage: 'User successfully saved',
    relatedViews: [{
        view: Article,
        foreignKey: 'id',
        referenceKey: 'author_id'
    }]
};
