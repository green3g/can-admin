import dev from 'can-util/js/dev/dev';

export default function getJsonSafe (json) {
    try {
        return json ? JSON.parse(json) : {};
    } catch (e) {
        dev.warn(e, json);
        return {};
    }
}
