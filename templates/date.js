import stache from 'can-stache';


/**
 * formats dates into a pretty month/day/year format
 * @param  {String} date The input date
 * @return {String}      A pretty date
 */
export function dateFormatter (date) {
    if (!date) {
        return 'None';
    }
    date = new Date(date);
    return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
}

stache.registerHelper('shortDate', dateFormatter);
