
export function linkFormatter (obj) {
    const icon = obj.url.indexOf('http') !== -1 ? 'external-link' : 'link';
    return `<a href="${obj.url}" target="${obj.target || ''}"><i class="fa fa-fw fa-${icon}"></i> ${obj.text}</a>`;
}

export default linkFormatter;
