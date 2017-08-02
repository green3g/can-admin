/**
 * formats an image tag
 * @param  {String} obj a comma separated string of image paths
 * @return {String}     Image tag
 */
export function imageFormatter (obj) {
    if (!obj) {
        return 'None';
    }
    return obj.split(',').map(function (item) {
        return `<p><a href="${item}" target="_blank"><img style="width:100px;" src="${item}" /></a></p>`;
    }).join('');
}

export default imageFormatter;
