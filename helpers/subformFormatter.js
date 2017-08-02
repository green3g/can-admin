import {imageFormatter} from './imageFormatter';
import dev from 'can-util/js/dev/dev';
import {makeSentenceCase} from '~/util/string/string';

const MAX_DEPTH = 3;

/**
 * formats a json object into a unordered list
 * @param  {string} json The JSON String
 * @return {String}         The List html
 */
export function subformFormatter (obj, title = 'Details', depth = 0) {
    if (depth > MAX_DEPTH) {
        return '';
    }
    depth ++;
    if (typeof title === 'object') {
      // not a valid title
        title = 'Details';
    }

    // if null or undefined
    if (!obj) {
        return 'None';
    }

    // if its a string, maybe we should parse some json
    if (typeof obj === 'string') {
        if (obj.indexOf('{}') > -1) {
            try {
                obj = JSON.parse(obj || null);
            } catch (e) {
                dev.warn(e, obj);
                return obj;
            }
        } else {
            return obj;
        }
    }

    // add a title if needed
    if (title) {
        title = `<div class="card-header"><h4 class="card-title">${title}</h4></div>`;
    }
    var content = '';
    if (obj.serialize) {
        obj = obj.serialize();
    }
    for (var prop in obj) {
        if (obj[prop] !== null && typeof obj[prop] !== 'undefined') {
            var val = obj[prop];
            if (typeof obj[prop] === 'object' && Boolean(obj[prop])) {
                val = subformFormatter(obj[prop], makeSentenceCase(prop), depth);
            } else if (typeof obj[prop] === 'string' && obj[prop].indexOf('uploads') !== -1) {
                val = imageFormatter(obj[prop]);
            } else if (typeof obj[prop] === 'boolean') {
                val = `${obj[prop] ? 'Yes' : 'No'}`;
            }
            content += `<p><strong>${makeSentenceCase(prop)}</strong>: ${val}</p>`;

        }
    }
    return `<div class="card">${title}<div class="card-body">${content}</div></div>`;
}

export default subformFormatter;
