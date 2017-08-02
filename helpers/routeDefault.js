import route from 'can-route';


/**
 * A helper function to find nested route default object values. If the property
 * is several layers deep, use a period to separate the path. IE, `'my.prop.value.name'`
 * @param  {String} key A path to a property on the route.data.defaults object
 * @return {*}     The property or `null`
 */
export default function routeDefault (key) {

    const path = key ? key.split('.') : [];
    let obj = route.data.defaults ? route.data.defaults : {};
    for (let i = 0; i < path.length; i ++) {
        if (!obj.hasOwnProperty(path[i])) {
            return null;
        }
        obj = obj[path[i]];
    }
    return obj;
}
