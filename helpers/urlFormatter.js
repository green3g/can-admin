import {iconFormatter} from './iconFormatter';

export function urlFormatter (url, text = 'Link', blank = false, button = false) {
    const external = url.indexOf('http') !== -1;
    return `<a ${(button ? 'class="btn btn-primary"' : '')} href="${url}" ${(blank ? '" target="_blank"' : '')}>${text} ${iconFormatter(external ? 'external-link' : 'link')}</a>`;
}

export default urlFormatter;
