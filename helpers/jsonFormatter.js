import {imageFormatter} from './imageFormatter';
import dev from 'can-util/js/dev/dev';
import {makeSentenceCase} from '~/util/string/string';
/**
 * formats a json object into a unordered list
 * @param  {string} json The JSON String
 * @return {String}         The List html
 */
export function jsonFormatter (obj, title = '') {
    if (typeof obj === 'string') {
        try {
            obj = JSON.parse(obj || null);
        } catch (e) {
            dev.warn(e, obj);
            return obj;
        }
    }
    if (title) {
        title = `<div class="card-header"><h4 class="card-title">${title}</h4></div>`;
    }
    var content = '';
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (typeof obj[prop] === 'string' && obj[prop].indexOf('{') !== -1) {
                content += jsonFormatter(obj[prop], makeSentenceCase(prop));
            } else if (typeof obj[prop] === 'string' && obj[prop].indexOf('uploads') !== -1) {
                content += imageFormatter(prop);
            } else {
                content += `<p><strong>${makeSentenceCase(prop)}</strong>: ${obj[prop]}</p>`;
            }
        }
    }
    return `<div class="card">${title}<div class="card-body">${content}</div></div>`;
}

export default jsonFormatter;
