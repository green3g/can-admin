import linkFormatter from './linkFormatter';
function filepathFormatter (paths) {
    if (!paths) {
        return 'None';
    }
    return paths.split(',').map((path) => {
        let text;
        if (path) {
            text = path.split('/');
            text = text.length ? text[text.length - 1] : 'None';
        }
        return linkFormatter({
            target: '_blank',
            url: path ? path : '#',
            text: text
        });

    }).join('<br />');
}

export default filepathFormatter;
