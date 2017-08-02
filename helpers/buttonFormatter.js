
export function buttonFormatter (obj) {
    return `<a class="btn btn-primary" href="${obj.url}" target="${obj.target || ''}"><i class="fa fa-fw fa-${obj.icon}"></i> ${obj.text}</a>`;
}

export default buttonFormatter;
