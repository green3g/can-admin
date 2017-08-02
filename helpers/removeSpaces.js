export default function removeSpaces (str) {
    if (!str) {
        return '';
    }
    return str.replace(/ /g, '');
}
