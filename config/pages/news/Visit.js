import DefineMap from 'can-define/map/map';
//Lets create an instance of can-connect using can-restless flask factory
import factory from 'can-admin/behaviors/flask-restless/index';

export const Visit = factory({
    url: '/api/visit',
    name: 'visit',
    Map: DefineMap.extend({
        id: 'string',
        article_id: 'number',
        date: {
            type: 'date',
            //set a default date to now with the Value: Date constructor
            Value: Date
        }
    })
});

// define our view properties
// see can-crud/crud-manager/ViewMap for documentation on available properties
// we can export default module and the crud-app will automatically use this,
// or we could export let TaskModel = {....} and specify
// moduleID in the default.js config
export default {
    connection: Visit,
    title: 'Visits'
};

//save a visit if this file gets loaded
// 
