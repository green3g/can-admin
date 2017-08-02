import stache from 'can-stache';
function split (str, separator = ',') {
    if (!str) {
        return []; 
    }
    const paths = str.split(separator);
    return paths;
}

function filename (val) {
    if (!val) {
        return 'None';
    }
    val = val.split('/');
    val = val.length > 0 ? val[val.length - 1] : null;
    return val;
}

stache.registerHelper('split', split);
stache.registerHelper('filename', filename);
