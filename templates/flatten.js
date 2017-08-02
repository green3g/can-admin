import stache from 'can-stache';

export function isObject (data) {
    if (!data) {
        return false;
    }
    return typeof data === 'object';
}

export function flatten (data) {
    if (!data) {
        return data;
    }
    if (data.serialize) {
        data = data.serialize();
    }
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++) {
                recurse(cur[i], prop + '[' + i + ']');
            }
            if (l == 0) {
                result[prop] = [];
            }
        } else {
            var isEmpty = true;
            for (var p in cur) {
                if (cur.hasOwnProperty(p)) {
                    isEmpty = false;
                    recurse(cur[p], prop ? prop + '.' + p : p);
                }
                if (isEmpty && prop) {
                    result[prop] = {};
                }
            }
        }
    }
    recurse(data, '');
    return result;
}

stache.registerHelper('isObject', isObject);
stache.registerHelper('flatten', flatten);
